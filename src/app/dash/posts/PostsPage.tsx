"use client";

import { Table } from "antd";
import { type SorterResult } from "antd/es/table/interface";
import { useSession } from "next-auth/react";
import { pick } from "radash";
import { trpc, type RouterOutputs } from "~/lib/trpc";
import { useColumnsFromMeta } from "~/utils/hooks/useColumnsFromMeta";
import { usePaginationQueryParams } from "~/utils/hooks/usePaginationQueryParams";
import { useQueryParams } from "~/utils/hooks/useQueryParams";

export function PostsPage({ dataSource }: { dataSource: RouterOutputs["posts"]["getMany"] }) {
  const paginationParams = usePaginationQueryParams();
  const { queryParams, setQueryParams } = useQueryParams();
  const { data: session } = useSession();

  const { data } = trpc.posts.getMany.useQuery(
    {
      ...paginationParams,
      ...(pick(queryParams, ["filter", "sort", "order"]) as any),
      groupId: session?.user.groupId,
      meta: true,
    },
    { initialData: dataSource },
  );

  const { columns } = useColumnsFromMeta<typeof dataSource.items[number]>(data.meta?.columns || {});

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
      rowKey={(el) => el.id}
    ></Table>
  );
}
