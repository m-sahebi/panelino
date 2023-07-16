import { PAGE_SIZE, PAGE_SIZE_LIMIT } from "~/data/configs";
import { jsonParse, toNumber } from "~/utils/primitive";

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
  const ps = Math.min(Math.max(pageSize ?? limit ?? PAGE_SIZE, 1), PAGE_SIZE_LIMIT);
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

export function encodeQueryParamObjectValue(obj: object) {
  return Object.keys(obj).length ? encodeURIComponent(JSON.stringify(obj)) : undefined;
}
export function decodeQueryParamObjectValue<
  T extends Record<string, string | number | boolean | T[] | Record<string, T> | null>,
>(str: string) {
  return jsonParse<T>(decodeURIComponent(str));
}
