import { useQuery } from "@tanstack/react-query";
import { Form, Slider, Spin } from "antd";
import { toggle } from "radash";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useGetSet } from "react-use";
import { type ApiFilesGetResponseType } from "~/app/api/files/route";
import { CustomDropdown } from "~/components/CustomDropdown";
import { FileIcon } from "~/components/file/FileIcon";
import { useSelectionArea } from "~/hooks/useSelectionArea";
import { invariant } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

export const FileBrowser = React.memo(function FileBrowser({
  onSelect,
  onDoubleClick,
  multiSelect = false,
  className,
}: {
  onSelect?: (selectedFilesIds: string[], selectedFiles: any[]) => void;
  onDoubleClick?: (selectedFileId: string, selectedFile: any) => void;
  multiSelect?: boolean;
  className?: string;
}) {
  const [renameForm] = Form.useForm<{ name: string }>();
  const [zoom, setZoom] = useState(7);
  const { data, isLoading } = useQuery<ApiFilesGetResponseType>({ queryKey: ["/files"] });

  const [getSelectedFilesId, setSelectedFilesId] = useGetSet<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { DragSelection, dragging } = useSelectionArea({
    isEnabled: multiSelect,
    dragContainer: containerRef,
    selectables: ".selectable-item",
    onSelectionChange: setSelectedFilesId,
  });

  const selectAll = useCallback(() => {
    if (!multiSelect) return;
    const f = data?.items.map((itm) => itm.id) ?? [];
    setSelectedFilesId(f);
    invariant(data);
    onSelect?.(f, data.items);
  }, [multiSelect, setSelectedFilesId, onSelect, data]);

  const selectNone = useCallback(() => {
    if (!getSelectedFilesId().length) return;
    setSelectedFilesId([]);
    onSelect?.([], []);
  }, [setSelectedFilesId, getSelectedFilesId, onSelect]);

  const selectFile = useCallback(
    (fileId: string) => {
      invariant(data);
      if (multiSelect) {
        const s = toggle(getSelectedFilesId(), fileId);
        setSelectedFilesId(s);
        onSelect?.(
          s,
          data.items.filter((item) => s.includes(item.id)),
        );
      } else {
        setSelectedFilesId([fileId]);
        onSelect?.([fileId], [data.items.find((item) => item.id === fileId)]);
      }
    },
    [data, setSelectedFilesId, getSelectedFilesId, onSelect, multiSelect],
  );

  const contextMenu = useMemo(() => {
    return {
      items: multiSelect
        ? [
            { key: "0", label: "Select all", onClick: selectAll },
            { key: "1", label: "Select none", onClick: selectNone },
          ]
        : [],
    };
  }, [multiSelect, selectAll, selectNone]);

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

  const handleFileDelete = useCallback(
    (id: string) => {
      if (!getSelectedFilesId().includes(id)) return;
      invariant(data);
      const s = toggle(getSelectedFilesId(), id);
      setSelectedFilesId(s);
      onSelect?.(
        s,
        data.items.filter((item) => item.id !== id),
      );
    },
    [data, onSelect, getSelectedFilesId, setSelectedFilesId],
  );

  return (
    <CustomDropdown
      renderChildren={(c) => <div className={cn("flex w-full flex-col gap-6", className)}>{c}</div>}
      trigger={["contextMenu"]}
      menu={contextMenu}
    >
      <div className="flex items-center gap-3">
        Zoom:
        <Slider
          className="max-w-[12rem] flex-1"
          min={4}
          max={30}
          step={0.5}
          value={zoom}
          onChange={setZoom}
        />
      </div>
      <div
        tabIndex={0}
        className="w-full overflow-hidden rounded-lg outline outline-1 outline-daw-neutral-300"
        ref={containerRef}
        onClick={(ev) => !ev.defaultPrevented && !dragging.current && selectNone()}
      >
        <Spin spinning={isLoading} className={cn("w-full", className)}>
          <ul
            className="grid w-full place-content-center place-items-center justify-start p-4"
            style={{
              gridTemplateColumns: `repeat(auto-fit, minmax(min(${zoom}rem, 100%), 1fr))`,
              gridGap: "1rem 1rem",
              maxWidth: `${zoom * 1.4 * (data?.items.length ?? 0)}rem`,
            }}
          >
            {data?.items.map((file) => {
              const isSelected = getSelectedFilesId().includes(file.id);

              return (
                <li
                  data-key={file.id}
                  className="selectable-item list-none"
                  onClick={(ev) => {
                    !ev.defaultPrevented && selectFile(file.id);
                    ev.preventDefault();
                  }}
                  onDoubleClick={(ev) =>
                    !ev.defaultPrevented && onDoubleClick
                      ? onDoubleClick(file.id, file)
                      : window.open(`/api/files/${file.id}`, "_blank")
                  }
                  onKeyDown={(ev) => ev.code === "Space" && selectFile(file.id)}
                  key={file.id}
                >
                  <FileIcon
                    fileId={file.id}
                    fileName={file.name}
                    fileSize={file.size}
                    fileMimeType={file.mimeType}
                    width={zoom}
                    formInstance={renameForm}
                    onDelete={handleFileDelete}
                    selected={isSelected}
                    selectable
                  />
                </li>
              );
            })}
            <DragSelection />
          </ul>
        </Spin>
      </div>
    </CustomDropdown>
  );
});
