"use client";

import { Button, Collapse, Form, Input, InputNumber, Select, Table } from "antd";
import { type SorterResult } from "antd/es/table/interface";
import { message } from "antd/lib";
import { useMemo } from "react";
import { type RouterName } from "~/_server/routers";
import JsonPrettied from "~/components/JsonPrettied";
import { trpc, type RouterInputs, type RouterOutputs } from "~/lib/trpc";
import { clog } from "~/utils/debug";
import { useColumnsFromMeta } from "~/utils/hooks/useColumnsFromMeta";
import { usePaginationQueryParams } from "~/utils/hooks/usePaginationQueryParams";
import { useQueryParams } from "~/utils/hooks/useQueryParams";
import { camelCasePrettify } from "~/utils/primitive";
import { type Nullish } from "~/utils/type";

const getFormItem = {
  ["string"]: (p: string, t: any): React.ReactNode => (
    <Form.Item
      className={"m-0"}
      key={p}
      name={p}
      label={camelCasePrettify(p)}
      rules={[{ required: !t.isOptional }]}
    >
      <Input />
    </Form.Item>
  ),
  ["number"]: (p: string, t: any): React.ReactNode => (
    <Form.Item
      className={"m-0"}
      key={p}
      name={p}
      label={camelCasePrettify(p)}
      rules={[{ required: !t.isOptional }]}
    >
      <InputNumber className={"w-full"} />
    </Form.Item>
  ),
  ["union"]: (p: string, t: any): React.ReactNode => {
    return (
      <Form.Item
        className={"m-0"}
        key={p}
        name={p}
        label={camelCasePrettify(p)}
        rules={[{ required: !t.isOptional }]}
      >
        <Select
          allowClear={t.isOptional}
          options={(t as { options: any[] }).options.map((el) => ({
            label: camelCasePrettify(el.value),
            value: el.value,
          }))}
        ></Select>
      </Form.Item>
    );
  },
};

export default function ModelTable<
  TRouteUnion extends Exclude<RouterName, "schemas">,
  TRoute extends Nullish<TRouteUnion>,
  TData extends Nullish<Record<string, any>>, //TRoute extends TRoutes ? RouterOutputs[TRoute] : Nullish
  TMethodName extends Nullish<TRoute extends TRouteUnion ? keyof RouterInputs[TRoute] : Nullish>,
  TSchema extends Nullish<
    TRoute extends TRouteUnion ? RouterOutputs["schemas"]["getByName"] : Nullish
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
    { ...paginationParams, ...methodParams, meta: true },
    {
      initialData: dataSource,
      enabled: dataSource != null && !isMutation,
    },
  );
  const { columns } = useColumnsFromMeta(data?.meta?.columns ?? {});

  const { mutate, isLoading: isLoadingM } = (trpc as any)[routeName]?.[methodName]?.useMutation({
    onError: (e: any) => message.error(e.toString()),
    onSuccess: () => message.success("Success!"),
  });

  const dataSchemaEntries = useMemo(
    () => Object.entries(dataSchema?.input.properties ?? {}),
    [dataSchema],
  );

  const items = data?.items;

  return (
    <div className={"flex flex-col gap-4"}>
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
        layout={"vertical"}
        // labelCol={{ span: 6 }}
        // wrapperCol={{ span: 18 }}
        // style={{ maxWidth: 600 }}
        initialValues={queryParams}
        onFinish={(vals) => {
          isMutation ? mutate(vals) : setQueryParams(vals);
        }}
        // onFinishFailed={onFinishFailed}
        // autoComplete="off"
      >
        <Collapse defaultActiveKey={1}>
          <Collapse.Panel key={1} header={"Parameters"}>
            <div className={"mb-4 grid gap-4 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4"}>
              {dataSchemaEntries.map(([p, t]) => {
                return getFormItem[t.type as keyof typeof getFormItem]?.(p, t);
              })}
            </div>
            {dataSchemaEntries.length ? (
              <Form.Item className={"mb-0"}>
                <Button loading={isLoadingM} htmlType="submit">
                  Submit
                </Button>
              </Form.Item>
            ) : null}
          </Collapse.Panel>
        </Collapse>
      </Form>
      {isMutation || (!isLoading && !items) ? null : !columns.length ? (
        <JsonPrettied object={items} />
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
          onChange={({ current, pageSize, total }, filters, sorter, { action }) => {
            clog(action, filters);
            const s = sorter as SorterResult<object>;
            if (action === "sort") {
              if (!s.column) setQueryParams({ sort: undefined, order: undefined });
              else
                setQueryParams({
                  sort: s.field as string,
                  order: { ascend: "asc", descend: "desc" }[s.order as string],
                });
            }

            if (action === "paginate") setQueryParams({ page: current, pageSize });
          }}
        />
      )}
    </div>
  );
}
