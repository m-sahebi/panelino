import { boxesIntersect, useSelectionContainer } from "@air/react-drag-to-select";
import { type UseSelectionContainerParams } from "@air/react-drag-to-select/dist/hooks/useSelectionContainer";
import { useCallback, useRef } from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { windowClearSelection } from "~/utils/primitive";
import { type Nullish } from "~/utils/type";

type Key = string;

export function useSelectionArea({
  onSelectionStart,
  onSelectionEnd,
  shouldStartSelecting,
  dragContainer,
  selectables,
  onSelectionChange,
  ...opt
}: SimpleMerge<
  UseSelectionContainerParams<HTMLElement>,
  {
    dragContainer: { current: HTMLElement | null } | string;
    selectables: { current: HTMLElement[] | null } | string;
    onSelectionChange?: (keys: ((prevKeys: Key[]) => Key[]) | Key[]) => void;
  }
>) {
  const dragContainerRef = useRef<HTMLElement | null>(null);
  const selectableItems = useRef<HTMLElement[] | null>(null);
  const selectableItemsKey = useRef<Key[] | null>(null);
  const dragging = useRef(false);
  const v = useSelectionContainer({
    onSelectionChange: (box) => {
      const selections: Key[] = [];
      // selectableItems is already init in onSelectionStart
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      selectableItems.current!.forEach((item, idx) => {
        if (boxesIntersect(box, item.getBoundingClientRect())) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selections.push(selectableItemsKey.current![idx]);
        }
      });
      onSelectionChange?.(selections);
    },
    ...opt,
    shouldStartSelecting(el) {
      if (!(shouldStartSelecting?.(el) ?? true)) return false;
      if (!dragContainer) {
        windowClearSelection();
        return true;
      }
      dragContainerRef.current ??=
        typeof dragContainer === "string"
          ? document.querySelector(dragContainer)
          : dragContainer.current;
      if (
        dragContainerRef.current &&
        el instanceof HTMLElement &&
        dragContainerRef.current.contains(el)
      ) {
        windowClearSelection();
        // setSelection?.([]);
        return true;
      }
      return false;
    },
    onSelectionStart(...args) {
      if (
        selectableItems.current == null &&
        (typeof selectables === "string" || selectables.current)
      ) {
        const items =
          typeof selectables === "string"
            ? document.querySelectorAll(selectables)
            : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              selectables.current!;
        selectableItems.current = [];
        selectableItemsKey.current = [];
        items.forEach((item) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selectableItems.current!.push(item as HTMLElement);
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          selectableItemsKey.current!.push(item.getAttribute("data-key") ?? "");
        });
      }
      dragging.current = true;
      windowClearSelection();
      onSelectionStart?.(...args);
    },
    onSelectionEnd(...args) {
      onSelectionEnd?.(...args);
      setTimeout(() => (dragging.current = false), 0);
    },
  });

  const addToSelectableItems = useCallback((el: Nullish<HTMLElement>, key: Key) => {
    if (!el) return;
    selectableItems.current ??= [];
    selectableItemsKey.current ??= [];
    if (!selectableItemsKey.current.includes(key)) {
      selectableItemsKey.current.push(key);
      selectableItems.current.push(el);
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
