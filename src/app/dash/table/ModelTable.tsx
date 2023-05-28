"use client";

import { Button, Collapse, Form, Input, InputNumber, Select, Table } from "antd";
import { type SorterResult } from "antd/es/table/interface";
import { message } from "antd/lib";
import { isArray } from "radash";
import { useMemo } from "react";
import { type z } from "zod";
import { type RouterName } from "~/_server/routers";
import { trpc, type RouterInputs, type RouterOutputs } from "~/lib/trpc";
import { clog } from "~/utils/clog";
import { useColumnsFromSchema } from "~/utils/hooks/useColumnsFromSchema";
import { usePaginationQueryParams } from "~/utils/hooks/usePaginationQueryParams";
import { useQueryParams } from "~/utils/hooks/useQueryParams";
import { type Nullish } from "~/utils/type";
import { ZodFirstPartyTypeKind, type ZodParsedDef } from "~/utils/zod";

const getFormItem = {
  [ZodFirstPartyTypeKind.ZodString]: (p: string, t: ZodParsedDef): React.ReactNode => (
    <Form.Item key={p} name={p} label={p} rules={[{ required: !t.nullish }]}>
      <Input />
    </Form.Item>
  ),
  [ZodFirstPartyTypeKind.ZodNumber]: (p: string, t: ZodParsedDef): React.ReactNode => (
    <Form.Item key={p} name={p} label={p} rules={[{ required: !t.nullish }]}>
      <InputNumber />
    </Form.Item>
  ),
  [ZodFirstPartyTypeKind.ZodNativeEnum]: (
    p: string,
    t: ZodParsedDef,
  ): React.ReactNode => (
    <Form.Item key={p} name={p} label={p} rules={[{ required: !t.nullish }]}>
      <Input />
    </Form.Item>
  ),
};

export default function ModelTable<
  TRouteUnion extends Exclude<RouterName, "schemas">,
  TRoute extends Nullish<TRouteUnion>,
  TData extends Nullish<object>, //TRoute extends TRoutes ? RouterOutputs[TRoute] : Nullish
  TMethodName extends Nullish<
    TRoute extends TRouteUnion ? keyof RouterInputs[TRoute] : Nullish
  >,
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
  methodParms,
  routesList,
  methodsList,
}: {
  dataSource: TData;
  routeName: TRoute;
  dataSchema: TSchema;
  methodName: TMethodName;
  methodParms: TMehodParams;
  routesList: RouterName[];
  methodsList: Nullish<TMethodName[]>;
}) {
  const { columns } = useColumnsFromSchema(
    dataSchema?.output.obj?.items.arr?.obj ?? dataSchema?.output.obj?.items.obj ?? {},
  );
  const paginationParams = usePaginationQueryParams();
  const { queryParams, setQueryParams } = useQueryParams();

  const { data, isLoading } = (trpc as any)[routeName]?.[methodName]?.useQuery(
    { ...paginationParams, ...methodParms },
    {
      initialData: dataSource,
      enabled: dataSchema?.isMutation != null ? !dataSchema?.isMutation : false,
    },
  );

  const { mutate, isLoading: isLoadingM } = (trpc as any)[routeName]?.[
    methodName
  ]?.useMutation({
    onError: (e: any) => message.error(e.toString()),
    onSuccess: () => message.success("Success!"),
  });

  const dataSchemaEntries: [
    string,
    ZodParsedDef<z.ZodTypeDef & { typeName?: ZodFirstPartyTypeKind }>,
  ][] = useMemo(() => Object.entries(dataSchema?.input.obj ?? {}), [dataSchema]);

  const items = data && (isArray(data.items) ? data.items : [data.items]);

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
        style={{ maxWidth: 600 }}
        initialValues={queryParams}
        onFinish={(vals) => {
          dataSchema?.isMutation ? mutate(vals) : setQueryParams(vals);
        }}
        // onFinishFailed={onFinishFailed}
        // autoComplete="off"
      >
        <Form.Item>
          <Collapse defaultActiveKey={1}>
            <Collapse.Panel key={1} header={"Parameters"}>
              {dataSchemaEntries.map(([p, t]) => {
                return getFormItem[t.typeName as keyof typeof getFormItem]?.(p, t);
              })}
            </Collapse.Panel>
          </Collapse>
        </Form.Item>
        {dataSchemaEntries.length ? (
          <Form.Item wrapperCol={{ offset: 0 }}>
            <Button loading={isLoadingM} type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        ) : null}
      </Form>
      {dataSchema?.isMutation || (!isLoading && !items) ? null : (
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
