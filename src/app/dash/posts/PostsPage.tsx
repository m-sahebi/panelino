"use client";

import { Table } from "antd";
import { useSession } from "next-auth/react";
import { pick } from "radash";
import { useAntTableHandleChange } from "~/hooks/useAntTableHandleChange";
import { useColumnsFromMeta } from "~/hooks/useColumnsFromMeta";
import { usePaginationQueryParams } from "~/hooks/usePaginationQueryParams";
import { useQueryParams } from "~/hooks/useQueryParams";
import { trpc, type RouterOutputs } from "~/lib/trpc";

export function PostsPage({ dataSource }: { dataSource: RouterOutputs["posts"]["getMany"] }) {
  const paginationParams = usePaginationQueryParams();
  const { queryParams } = useQueryParams();
  const { data: session } = useSession();

  const { data } = trpc.posts.getMany.useQuery(
    {
      ...paginationParams,
      ...(pick(queryParams, ["search", "filter", "sort", "order"]) as any),
      groupId: session?.user.groupId,
      meta: "TRUE",
    },
    { initialData: dataSource },
  );

  type Item = (typeof dataSource.items)[number];
  const { columns } = useColumnsFromMeta<Item>(data?.meta?.columns || {});
  const { handleTableChange } = useAntTableHandleChange<Item>();

  return (
    <Table
      scroll={{ x: true }}
      pagination={{
        current: dataSource.page,
        pageSize: dataSource.pageSize,
        total: dataSource.total,
      }}
      onChange={handleTableChange}
      columns={columns}
      dataSource={data?.items}
      rowKey={(el) => el.id}
    />
  );
}
