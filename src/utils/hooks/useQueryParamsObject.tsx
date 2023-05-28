import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useQueryParamsObject() {
  const sp = useSearchParams();
  return useMemo(() => Object.fromEntries(sp), [sp.toString()]);
}
