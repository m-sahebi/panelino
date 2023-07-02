import { Modal } from "antd";
import { type ModalFunc } from "antd/es/modal/confirm";
import { type ModalFuncProps } from "antd/es/modal/interface";
import React from "react";
import { type SimpleMerge } from "type-fest/source/merge";
import { FileBrowser } from "~/components/file/FileBrowser";
import { FileUpload } from "~/components/file/FileUpload";
import { globalModal } from "~/components/Providers/AntdProvider";
import { cn } from "~/utils/tailwind";

let _modal: ReturnType<ModalFunc>, _onOk: ((filesid: string[]) => void) | undefined;
let _selectedFilesId: string[] = [];
function handleSelect(ids: string[]) {
  _selectedFilesId = ids;
}
function handleDoubleClick(fileId: string) {
  _selectedFilesId = [fileId];
  _onOk?.([fileId]);
  _modal.destroy();
}
export function modalFilePicker({
  multiple = false,
  ...p
}: SimpleMerge<
  ModalFuncProps,
  {
    multiple?: boolean;
    onOk?: (filesId: string[]) => void;
  }
>) {
  _onOk = p.onOk;
  if (_modal) _modal.destroy();
  _modal = (globalModal ?? Modal).confirm({
    icon: null,
    width: "100%",
    title: multiple ? "Choose files" : "Choose a file",
    wrapClassName: "full-modal-confirm-content",
    content: (
      <div className="flex w-full flex-col gap-6">
        <style>{`.full-modal-confirm-content .ant-modal-confirm-content{max-width: 100% !important;}`}</style>
        <FileUpload />
        <FileBrowser
          multiple={multiple}
          onSelect={handleSelect}
          onDoubleClick={handleDoubleClick}
        />
      </div>
    ),
    ...p,
    className: cn("top-4 max-w-screen-lg px-4", p.className),
    afterClose: () => {
      _selectedFilesId = [];
      p.afterClose?.();
    },
    onOk: async () => {
      return p.onOk?.(_selectedFilesId);
    },
  });
  return _modal;
}
