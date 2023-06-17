"use client";

import { Button, Collapse, Form, Select, Table } from "antd";
import { message } from "antd/lib";
import { useMemo } from "react";
import { type SzType } from "zodex";
import { type RouterName } from "~/_server/routers";
import { AntFormItem } from "~/components/AntFormItem";
import JsonPrettied from "~/components/JsonPrettied";
import { trpc, type RouterInputs, type RouterOutputs } from "~/lib/trpc";
import { useAntTableOnChange } from "~/utils/hooks/useAntTableOnChange";
import { useColumnsFromMeta } from "~/utils/hooks/useColumnsFromMeta";
import { usePaginationQueryParams } from "~/utils/hooks/usePaginationQueryParams";
import { useQueryParams } from "~/utils/hooks/useQueryParams";
import { type Nullish } from "~/utils/type";

export default function DataViewPage<
  TRouteUnion extends Exclude<RouterName, "schemas">,
  TRoute extends Nullish<TRouteUnion>,
  TData extends Nullish<Record<string, any>>, //TRoute extends TRoutes ? RouterOutputs[TRoute] : Nullish
  TMethodName extends Nullish<TRoute extends TRouteUnion ? keyof RouterInputs[TRoute] : Nullish>,
  TSchema extends Nullish<
    TRoute extends TRouteUnion ? RouterOutputs["schemas"]["getByMethodName"] : Nullish
  >,
  TMehodParams extends Nullish<
    TRoute extends TRouteUnion
      ? TMethodName extends keyof RouterInputs[TRoute]
        ? RouterInputs[TRoute][TMethodName]
        : Nullish
      : Nullish
  >,
>({
  dataSource,
  dataSchema,
  routeName,
  methodName,
  methodParams,
  routesList,
  methodsList,
}: {
  dataSource: TData;
  routeName: TRoute;
  dataSchema: TSchema;
  methodName: TMethodName;
  methodParams: TMehodParams;
  routesList: RouterName[];
  methodsList: Nullish<TMethodName[]>;
}) {
  const paginationParams = usePaginationQueryParams();
  const { queryParams, setQueryParams } = useQueryParams();
  const isMutation = dataSchema?.isMutation;

  const { data, isLoading } = (trpc as any)[routeName]?.[methodName]?.useQuery(
    { meta: "TRUE", ...paginationParams, ...methodParams },
    {
      initialData: dataSource,
      enabled: dataSource != null && !isMutation,
    },
  );
  const { columns } = useColumnsFromMeta(
    data?.meta?.columns ??
      (dataSchema?.output?.properties?.items as any)?.element?.properties ??
      {},
  );
  const { handleTableChange } = useAntTableOnChange();

  const { mutate, isLoading: isLoadingM } = (trpc as any)[routeName]?.[methodName]?.useMutation({
    onError: (e: any) => message.error(e.toString()),
    onSuccess: () => message.success("Form submitted successfully"),
  });

  const dataSchemaEntries = useMemo(
    () => Object.entries(dataSchema?.input.properties ?? {}) as [string, SzType][],
    [dataSchema],
  );

  const items = data?.items;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <Select
          defaultValue={routeName}
          placeholder="Route"
          style={{ width: 120 }}
          onChange={(val) => {
            setQueryParams({
              ...Object.keys(queryParams).reduce((acc, key) => {
                acc[key] = undefined;
                return acc;
              }, {} as { [p in keyof typeof queryParams]: undefined }),
              _route: val ?? undefined,
            });
          }}
          options={routesList.map((val) => ({ label: val, value: val }))}
        />
        <Select
          value={methodName}
          placeholder="Method"
          style={{ width: 120 }}
          onChange={(val) => {
            setQueryParams({
              ...Object.keys(queryParams).reduce((acc, key) => {
                acc[key] = undefined;
                return acc;
              }, {} as { [p in keyof typeof queryParams]: undefined }),
              _route: queryParams._route,
              _method: (val as Exclude<typeof val, symbol>) ?? undefined,
            });
          }}
          options={methodsList?.map((val) => ({ label: val, value: val }))}
        />
      </div>
      <Form
        name="basic"
        layout="vertical"
        initialValues={queryParams}
        onFinish={(vals) => {
          isMutation ? mutate(vals) : setQueryParams(vals);
        }}
      >
        <Collapse defaultActiveKey={1}>
          <Collapse.Panel key={1} header="Parameters">
            <div className="mb-6 grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
              {dataSchemaEntries.map(([p, t]) => {
                return AntFormItem[t.type as keyof typeof AntFormItem]?.(p, t);
              })}
            </div>
            {dataSchemaEntries.length ? (
              <Form.Item className="mb-0">
                <Button loading={isLoadingM} htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            ) : null}
          </Collapse.Panel>
        </Collapse>
      </Form>
      {isMutation || (!isLoading && !items) ? null : !columns.length ? (
        <JsonPrettied className="whitespace-pre-wrap" object={items} />
      ) : (
        <Table
          loading={isLoading}
          scroll={{ x: true }}
          pagination={
            data?.total
              ? {
                  current: data?.page,
                  pageSize: data?.pageSize,
                  total: data?.total,
                }
              : false
          }
          columns={columns}
          rowKey={(el: any) => el.id}
          dataSource={items}
          onChange={handleTableChange}
        />
      )}
    </div>
  );
}
