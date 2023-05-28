import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

export function useQueryParams<T = Record<string, string | number>>() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return useMemo(() => {
    const queryParams = new URLSearchParams(sp);
    return {
      queryParams: Object.fromEntries(queryParams) as Partial<T>,
      setQueryParams: (searchParamsObject: Partial<T>) => {
        Object.entries(searchParamsObject).forEach(([key, val]) => {
          if (!val) {
            queryParams.delete(key);
          } else {
            queryParams.set(key, String(val));
          }
        });
        const search = queryParams.toString();
        const query = search ? `?${search}` : "";
        router.push(`${pathname}${query}`);
      },
    } as const;
  }, [sp, pathname, router]);
}
