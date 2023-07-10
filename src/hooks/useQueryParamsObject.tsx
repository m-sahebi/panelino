import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useQueryParamsObject() {
  const sp = useSearchParams();
  const queryParams = useMemo(() => Object.fromEntries(sp), [sp]);
  return { queryParams };
}
