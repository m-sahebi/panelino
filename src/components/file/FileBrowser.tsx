import { useQuery } from "@tanstack/react-query";
import { Form, Slider, Spin } from "antd";
import { toggle } from "radash";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useGetSet } from "react-use";
import { type ApiFilesGetResponseType } from "~/app/api/files/route";
import { CustomDropdown } from "~/components/CustomDropdown";
import { FileIcon } from "~/components/file/FileIcon";
import { useSelectionArea } from "~/utils/hooks/useSelectionArea";
import { cn } from "~/utils/tailwind";

export const FileBrowser = React.memo(function FileBrowser({
  onSelect,
  onDoubleClick,
  multiple = true,
  className,
}: {
  onSelect?: (selectedFilesIds: string[]) => void;
  onDoubleClick?: (selectedFileId: string) => void;
  multiple?: boolean;
  className?: string;
}) {
  const [renameForm] = Form.useForm<{ name: string }>();
  const [zoom, setZoom] = useState(7);
  const { data, isFetching } = useQuery<ApiFilesGetResponseType>({ queryKey: ["/files"] });

  const [getSelectedFilesId, setSelectedFilesId] = useGetSet<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { DragSelection, dragging, addToSelectableItems } = useSelectionArea({
    getTarget: () => containerRef.current,
    setSelection: setSelectedFilesId,
  });

  const selectAll = useCallback(() => {
    if (!multiple) return;
    const f = data?.items.map((itm) => itm.id) ?? [];
    setSelectedFilesId(f);
    onSelect?.(f);
  }, [multiple, setSelectedFilesId, onSelect, data]);

  const selectNone = useCallback(() => {
    if (!getSelectedFilesId().length) return;
    setSelectedFilesId([]);
    onSelect?.([]);
  }, [setSelectedFilesId, getSelectedFilesId, onSelect]);

  const selectFile = useCallback(
    (fileId: string) => {
      if (multiple) {
        const s = toggle(getSelectedFilesId(), fileId);
        setSelectedFilesId(s);
        onSelect?.(s);
      } else {
        setSelectedFilesId([fileId]);
        onSelect?.([fileId]);
      }
    },
    [setSelectedFilesId, getSelectedFilesId, onSelect, multiple],
  );

  const contextMenu = useMemo(() => {
    return {
      items: multiple
        ? [
            { key: "0", label: "Select all", onClick: selectAll },
            { key: "1", label: "Select none", onClick: selectNone },
          ]
        : [],
    };
  }, [multiple, selectAll, selectNone]);

  function handleKeyCtrlA(ev: KeyboardEvent) {
    ev.preventDefault();
    selectAll();
  }
  function handleKeyEscape(ev: KeyboardEvent) {
    ev.preventDefault();
    selectNone();
  }
  useHotkeys("Ctrl+A", handleKeyCtrlA, {}, [selectAll]);
  useHotkeys("Escape", handleKeyEscape, {}, [selectNone]);

  return (
    <div ref={containerRef} className={cn("flex w-full flex-col gap-6", className)}>
      <div className="flex items-center gap-3">
        Zoom:
        <Slider
          className="max-w-[12rem] flex-1"
          min={4}
          max={30}
          step={1}
          value={zoom}
          onChange={setZoom}
        />
      </div>
      <Spin spinning={isFetching} className={cn("w-full", className)}>
        <CustomDropdown
          renderChildren={(c) => (
            <ul
              tabIndex={0}
              className="grid w-full place-content-center place-items-center justify-start rounded-lg p-2 outline-0"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(min(${zoom}rem, 100%), 1fr))`,
                gridGap: "1rem 1rem",
                maxWidth: `${zoom * 1.4 * (data?.items.length ?? 0)}rem`,
              }}
              onClick={(ev) => {
                if (!ev.defaultPrevented && !dragging.current) {
                  selectNone();
                }
              }}
            >
              {c}
            </ul>
          )}
          trigger={["contextMenu"]}
          menu={contextMenu}
        >
          {data?.items.map((file) => {
            const isSelected = getSelectedFilesId().includes(file.id);

            return (
              <li
                ref={(el) => addToSelectableItems(el, file.id)}
                role="checkbox"
                aria-checked={String(isSelected) as "true" | "false"}
                aria-labelledby={`file_${file.id}`}
                tabIndex={0}
                className={cn(
                  `list-none rounded transition-all
                   hover:shadow-[0_0_0_2px_rgba(var(--color-primary))]
                   focus:shadow-[0_0_0_2px_rgba(var(--color-primary))]`,
                  { "bg-primary/30": isSelected, "rounded-lg": zoom > 6 },
                )}
                onClick={(ev) => {
                  !ev.defaultPrevented && selectFile(file.id);
                  ev.preventDefault();
                }}
                onDoubleClick={(ev) =>
                  !ev.defaultPrevented && onDoubleClick
                    ? onDoubleClick(file.id)
                    : window.open(`/api/files/${file.id}`, "_blank")
                }
                onKeyDown={(ev) => ev.code === "Space" && selectFile(file.id)}
                key={file.id}
              >
                <FileIcon
                  fileId={file.id}
                  fileName={file.name}
                  fileMimeType={file.mimeType}
                  width={zoom}
                  formInstance={renameForm}
                />
              </li>
            );
          })}
          <DragSelection />
        </CustomDropdown>
      </Spin>
    </div>
  );
});
