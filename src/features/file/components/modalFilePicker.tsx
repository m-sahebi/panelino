import { Modal } from "antd";
import { type ModalFunc } from "antd/es/modal/confirm";
import { type ModalFuncProps } from "antd/es/modal/interface";
import React from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { globalModal } from "~/components/configs/Providers/AntProvider";
import { type FileModel } from "~/data/models/file";
import { FileBrowser } from "~/features/file/components/FileBrowser";
import { FileTypesInfo } from "~/features/file/components/FileTypesInfo";
import { FileUpload } from "~/features/file/components/FileUpload";
import { cn } from "~/utils/tailwind";

let _modal: ReturnType<ModalFunc>,
  _onOk: ((filesId: string[], files: FileModel[]) => void) | undefined;
let _selectedFilesId: string[] = [];
let _selectedFiles: FileModel[] = [];

function handleSelect(ids: string[], files: FileModel[]) {
  _selectedFilesId = ids;
  _selectedFiles = files;
  const okBtn = document.querySelector("[data-modal-ok-btn]");
  if (ids.length) okBtn?.removeAttribute("disabled");
  else okBtn?.setAttribute("disabled", "true");
}
function handleDoubleClick(fileId: string, file: FileModel) {
  _selectedFilesId = [fileId];
  _selectedFiles = [file];
  _onOk?.([fileId], [file]);
  _modal.destroy();
}
export function modalFilePicker({
  multiSelect = false,
  fileTypes,
  ...p
}: SimpleMerge<
  ModalFuncProps,
  {
    multiSelect?: boolean;
    onOk?: (filesId: string[], files: FileModel[]) => void;
    fileTypes?: string;
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
    title: (
      <div className="flex-center gap-2">
        {multiSelect ? "Choose files" : "Choose a file"}
        <FileTypesInfo fileTypes={fileTypes} />
      </div>
    ),
    ...p,
    content: (
      <div className="flex w-full flex-col gap-6">
        <FileUpload hideFileTypesInfo fileTypes={fileTypes} />
        <FileBrowser
          hideFileTypesInfo
          multiSelect={multiSelect}
          fileTypes={fileTypes}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
        />
      </div>
    ),
    wrapClassName: cn(p.wrapClassName, "full-modal-confirm-content"),
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
