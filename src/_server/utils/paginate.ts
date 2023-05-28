import { MAX_PAGE_SIZE, PAGE_SIZE } from "~/data/configs";
import { toNumber } from "~/utils/to-number";

export function paginate(
  {
    offset = 0,
    limit = PAGE_SIZE,
    page,
    pageSize,
  }: {
    offset?: number | null;
    limit?: number | null;
    page?: number | null;
    pageSize?: number | null;
  },
  total?: number,
) {
  const ps = Math.min(Math.max(pageSize ?? limit ?? PAGE_SIZE, 1), MAX_PAGE_SIZE);
  let p = Math.max(page ?? Math.floor((offset ?? 0) / ps) + 1, 1);

  if (total) {
    p = Math.min(p, Math.ceil(total / ps));
  }

  return [
    {
      take: ps,
      skip: (p - 1) * (pageSize || PAGE_SIZE),
    },
    { page: p, pageSize: ps },
  ] as const;
}

export function paginateParams(p: {
  offset?: string | string[];
  limit?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
}) {
  const page = toNumber(p.page);
  const pageSize = toNumber(p.pageSize);
  const offset = toNumber(p.offset);
  const limit = toNumber(p.limit);

  return paginate({
    page,
    pageSize,
    offset,
    limit,
  })[1];
}
