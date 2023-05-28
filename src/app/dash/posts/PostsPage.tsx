"use client";

import { Table } from "antd";
import { type SorterResult } from "antd/es/table/interface";
import { pick } from "radash";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { useColumnsFromSchema } from "~/utils/hooks/useColumnsFromSchema";
import { usePaginationQueryParams } from "~/utils/hooks/usePaginationQueryParams";
import { useQueryParams } from "~/utils/hooks/useQueryParams";
import { type ZodParsedDef } from "~/utils/zod";

export function PostsPage({
  dataSource,
  dataSchema,
}: {
  dataSource: RouterOutputs["posts"]["getMany"];
  dataSchema: {
    [p: string]: ZodParsedDef;
  };
}) {
  const paginationParams = usePaginationQueryParams();
  const { queryParams, setQueryParams } = useQueryParams();

  const { columns } = useColumnsFromSchema(dataSchema);
  const { data } = trpc.posts.getMany.useQuery(
    {
      ...paginationParams,
      ...(pick(queryParams, ["filter", "sort", "order"]) as any),
    },
    { initialData: dataSource },
  );

  return (
    <Table
      scroll={{ x: true }}
      pagination={{
        current: dataSource.page,
        pageSize: dataSource.pageSize,
        total: dataSource.total,
      }}
      onChange={({ current, pageSize, total }, filters, sorter, { action }) => {
        if (action === "paginate") setQueryParams({ page: current, pageSize });
        if (action === "sort") {
          const s = sorter as SorterResult<object>;
          if (!s.column) setQueryParams({ sort: undefined, order: undefined });
          else
            setQueryParams({
              sort: s.field as string,
              order: { ascend: "asc", descend: "desc" }[s.order as string],
            });
        }
      }}
      columns={columns}
      dataSource={data.items}
    ></Table>
  );
}
