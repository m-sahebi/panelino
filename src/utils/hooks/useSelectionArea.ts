import { boxesIntersect, useSelectionContainer } from "@air/react-drag-to-select";
import { type UseSelectionContainerParams } from "@air/react-drag-to-select/dist/hooks/useSelectionContainer";
import { useCallback, useRef } from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { windowClearSelection } from "~/utils/primitive";
import { type Nullish } from "~/utils/type";

export function useSelectionArea<TKey extends {}>({
  onSelectionStart,
  onSelectionEnd,
  shouldStartSelecting,
  getTarget,
  setSelection,
  ...opt
}: SimpleMerge<
  UseSelectionContainerParams<HTMLElement>,
  {
    getTarget?: () => Nullish<HTMLElement>;
    setSelection?: (keys: TKey[]) => void;
  }
>) {
  const selectableItems = useRef<{ element: HTMLElement; key: TKey }[]>([]);
  const selectableItemsKey = useRef<TKey[]>([]);
  const dragging = useRef(false);
  const v = useSelectionContainer({
    onSelectionChange: (box) => {
      const selections: TKey[] = [];
      selectableItems.current.forEach((item) => {
        if (boxesIntersect(box, item.element.getBoundingClientRect())) {
          selections.push(item.key);
        }
      });
      setSelection?.(selections);
    },
    ...opt,
    onSelectionStart(...args) {
      dragging.current = true;
      windowClearSelection();
      onSelectionStart?.(...args);
    },
    onSelectionEnd(...args) {
      onSelectionEnd?.(...args);
      setTimeout(() => (dragging.current = false), 0);
    },
    shouldStartSelecting(el) {
      if (!(shouldStartSelecting?.(el) ?? true)) return false;
      if (!getTarget) {
        windowClearSelection();
        return true;
      }
      const t = getTarget();
      if (t && el instanceof HTMLElement && t.contains(el)) {
        windowClearSelection();
        // setSelection?.([]);
        return true;
      }
      return false;
    },
  });

  const addToSelectableItems = useCallback((el: Nullish<HTMLElement>, key: TKey) => {
    if (!el) return;
    if (!selectableItemsKey.current.includes(key)) {
      selectableItemsKey.current.push(key);
      selectableItems.current.push({
        element: el,
        key,
      });
    }
  }, []);

  return {
    ...v,
    dragging,
    selectableItems,
    selectableItemsKey,
    addToSelectableItems,
  };
}
