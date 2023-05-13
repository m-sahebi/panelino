"use client";

import { Table, Tooltip } from "antd";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useMemo } from "react";
import { z, ZodObject, ZodRawShape } from "zod";
import { RoutePathType, RouteSchemas } from "@/data/schemas/routes";
import { FetchRes } from "@/server/utils/fetch";
import { zGetSchemaKeysListAndMeta, ZodFirstPartyTypeKind } from "@/utils/zod";

dayjs.extend(relativeTime);

export default function ModelTable<TRoute extends RoutePathType>({
  dataSource,
  route,
}: {
  route: TRoute;
  dataSource: FetchRes<TRoute>;
}) {
  const schema = RouteSchemas[route]["/"]?.get.response.element;

  const [keys, schemaKeysMeta] = useMemo(
    () => zGetSchemaKeysListAndMeta(schema as ZodObject<ZodRawShape>),
    [schema]
  );

  const columns: ColumnsType<z.infer<typeof schema>> = keys.map((key) => ({
    title: key,
    key,
    dataIndex: key,
    render:
      schemaKeysMeta[key].typeName === ZodFirstPartyTypeKind.ZodDate
        ? (text) => {
            if (!text) return null;
            const d = dayjs(text);
            return (
              <Tooltip title={d.format("YYYY-MM-DD HH:mm")}>
                {dayjs().from(d)}
              </Tooltip>
            );
          }
        : undefined,
  }));

  return <Table columns={columns} dataSource={dataSource}></Table>;
}
