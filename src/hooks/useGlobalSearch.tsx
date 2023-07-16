import { useAtom } from "jotai";
import { useCallback, useRef } from "react";
import { globalSearchAtom } from "~/store/atoms/global-search";

export function useGlobalSearch() {
  const [state, setState] = useAtom(globalSearchAtom);
  const stateRef = useRef(state);
  stateRef.current = state;

  const toggleGlobalSearchOpened = useCallback(
    () => setState((s) => ({ ...s, opened: !s.opened })),
    [setState],
  );

  return {
    globalSearch: state,
    toggleGlobalSearchOpened,
    setGlobalSearch: setState,
  };
}
