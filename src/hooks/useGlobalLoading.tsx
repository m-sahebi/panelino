import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { globalLoadingAtom } from "~/store/atoms/global-loading";
import { type Nullish } from "~/utils/type";

export function useGlobalLoading(val?: Nullish<number>) {
  const setGlobalLoading = useSetAtom(globalLoadingAtom);

  useLayoutEffect(() => {
    setGlobalLoading(val);
  }, [val, setGlobalLoading]);

  return { setGlobalLoading };
}
