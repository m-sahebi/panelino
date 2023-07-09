import { Modal } from "antd";
import { type ModalFunc } from "antd/es/modal/confirm";
import { type ModalFuncProps } from "antd/es/modal/interface";
import React from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { FileBrowser } from "~/components/file/FileBrowser";
import { FileUpload } from "~/components/file/FileUpload";
import { globalModal } from "~/components/Providers/AntdProvider";
import { cn } from "~/utils/tailwind";

let _modal: ReturnType<ModalFunc>, _onOk: ((filesId: string[], files: any[]) => void) | undefined;
let _selectedFilesId: string[] = [];
let _selectedFiles: any[] = [];

function handleSelect(ids: string[], files: any[]) {
  _selectedFilesId = ids;
  _selectedFiles = files;
  const okBtn = document.querySelector("[data-modal-ok-btn]");
  if (ids.length) okBtn?.removeAttribute("disabled");
  else okBtn?.setAttribute("disabled", "true");
}
function handleDoubleClick(fileId: string, file: any) {
  _selectedFilesId = [fileId];
  _selectedFiles = [file];
  _onOk?.([fileId], [file]);
  _modal.destroy();
}
export function modalFilePicker({
  multiSelect = false,
  ...p
}: SimpleMerge<
  ModalFuncProps,
  {
    multiSelect?: boolean;
    onOk?: (filesId: string[], files: any[]) => void;
  }
>) {
  _onOk = p.onOk;
  if (_modal) _modal.destroy();
  setTimeout(
    () => document.querySelector("[data-modal-ok-btn]")?.setAttribute("disabled", "true"),
    0,
  );
  _modal = (globalModal ?? Modal).confirm({
    icon: null,
    width: "100%",
    title: multiSelect ? "Choose files" : "Choose a file",
    ...p,
    content: (
      <div className="flex w-full flex-col gap-6">
        <FileUpload />
        <FileBrowser
          multiSelect={multiSelect}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
        />
      </div>
    ),
    wrapClassName: cn(p.icon && p.wrapClassName, "full-modal-confirm-content"),
    className: cn("top-4 max-w-screen-lg px-4", p.className),
    afterClose: () => {
      _selectedFilesId = [];
      _selectedFiles = [];
      p.afterClose?.();
    },
    onOk: async () => {
      return p.onOk?.(_selectedFilesId, _selectedFiles);
    },
    okButtonProps: { "data-modal-ok-btn": "" },
  });
  return _modal;
}
