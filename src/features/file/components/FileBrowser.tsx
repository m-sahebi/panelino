import { useQuery } from "@tanstack/react-query";
import { Form, Slider, Spin, Tooltip } from "antd";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toggle } from "radash";
import React, { useCallback, useMemo, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { LuEye } from "react-icons/lu";
import { useGetSet } from "react-use";
import { type ApiFilesGetResponseType } from "~/app/api/files/route";
import { CustomDropdown } from "~/components/CustomDropdown";
import { type FileModel } from "~/data/models/file";
import { FileIcon } from "~/features/file/components/FileIcon";
import { FileTypesInfo } from "~/features/file/components/FileTypesInfo";
import { useSelectionArea } from "~/hooks/useSelectionArea";
import { fileNameExt, invariant, nonNullable } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

const fileViewZoomAtom = atomWithStorage("fileViewZoomAtom", 7);

export const FileBrowser = React.memo(function FileBrowser({
  onSelect,
  onDoubleClick,
  multiSelect = false,
  className,
  fileTypes,
  hideFileTypesInfo = false,
}: {
  onSelect?: (selectedFilesIds: string[], selectedFiles: FileModel[]) => void;
  onDoubleClick?: (selectedFileId: string, selectedFile: FileModel) => void;
  multiSelect?: boolean;
  className?: string;
  fileTypes?: string;
  hideFileTypesInfo?: boolean;
}) {
  const [renameForm] = Form.useForm<{ name: string }>();
  const [zoom, setZoom] = useAtom(fileViewZoomAtom);
  const { data, isLoading } = useQuery<ApiFilesGetResponseType>({ queryKey: ["/files"] });
  const items = useMemo(() => {
    const types = fileTypes?.split(",");
    return types ? data?.items.filter((itm) => types.includes(fileNameExt(itm.name))) : data?.items;
  }, [fileTypes, data]);

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
    const f = items?.map((itm) => itm.id) ?? [];
    setSelectedFilesId(f);
    invariant(items);
    onSelect?.(f, items);
  }, [multiSelect, setSelectedFilesId, onSelect, items]);

  const selectNone = useCallback(() => {
    if (!getSelectedFilesId().length) return;
    setSelectedFilesId([]);
    onSelect?.([], []);
  }, [setSelectedFilesId, getSelectedFilesId, onSelect]);

  const selectFile = useCallback(
    (fileId: string) => {
      invariant(items);
      if (multiSelect) {
        const s = toggle(getSelectedFilesId(), fileId);
        setSelectedFilesId(s);
        onSelect?.(
          s,
          items.filter((item) => s.includes(item.id)),
        );
      } else {
        setSelectedFilesId([fileId]);
        onSelect?.([fileId], [nonNullable(items.find((item) => item.id === fileId))]);
      }
    },
    [items, setSelectedFilesId, getSelectedFilesId, onSelect, multiSelect],
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
      invariant(items);
      const s = toggle(getSelectedFilesId(), id);
      setSelectedFilesId(s);
      onSelect?.(
        s,
        items.filter((item) => item.id !== id),
      );
    },
    [items, onSelect, getSelectedFilesId, setSelectedFilesId],
  );

  return (
    <CustomDropdown
      renderChildren={(c) => <div className={cn("flex w-full flex-col gap-4", className)}>{c}</div>}
      trigger={["contextMenu"]}
      menu={contextMenu}
    >
      <div className="flex-center w-full flex-wrap justify-between gap-3">
        {!hideFileTypesInfo && <FileTypesInfo fileTypes={fileTypes} />}
        <div className="flex-center w-[12rem] max-w-full gap-2">
          <Tooltip title="Zoom level">
            <LuEye className="text-primary" size={18} />
          </Tooltip>
          <Slider
            className="my-1 flex-1"
            min={4}
            max={30}
            step={0.5}
            value={zoom}
            onChange={setZoom}
          />
        </div>
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
              maxWidth: `${zoom * 1.4 * (items?.length ?? 0)}rem`,
            }}
          >
            {items?.map((file) => {
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
