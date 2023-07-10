import { useSearchParams } from "next/navigation";
import { shake } from "radash";
import { toNumber } from "~/utils/primitive";

export function usePaginationQueryParams() {
  const { get } = useSearchParams();
  return shake({
    page: toNumber(get("page")),
    pageSize: toNumber(get("pageSize")),
    offset: toNumber(get("offset")),
    limit: toNumber(get("limit")),
  });
}
