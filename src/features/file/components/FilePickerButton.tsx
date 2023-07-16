import { Button, Tag } from "antd";
import { useState } from "react";
import { type FileModel } from "~/data/models/file";
import { FileTypesInfo } from "~/features/file/components/FileTypesInfo";
import { modalFilePicker } from "~/features/file/components/modalFilePicker";

export function FilePickerButton({
  onChange,
  value,
  fileTypes,
}: {
  onChange?: (fileId: string | undefined) => void;
  value?: string | undefined;
  fileTypes?: string;
}) {
  const [selectedFile, setSelectedFile] = useState<FileModel>();
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex-center gap-2">
        <Button
          onClick={() =>
            modalFilePicker({
              multiSelect: false,
              fileTypes: fileTypes,
              onOk: ([id], [file]) => {
                setSelectedFile(file);
                onChange?.(id);
              },
            })
          }
        >
          Choose file
        </Button>
        <FileTypesInfo fileTypes={fileTypes} collapsed />
      </div>
      <div className="ms-2 border-0 border-s-2 border-solid px-2 border-daw-neutral-300">
        <Tag
          hidden={!selectedFile && !value}
          closable
          onClose={(e) => {
            e.preventDefault();
            onChange?.(undefined);
            setSelectedFile(undefined);
          }}
        >
          {selectedFile
            ? selectedFile.name
            : value && (
                <>
                  <span className="font-light">id:&nbsp;</span>
                  {value}
                </>
              )}
        </Tag>
      </div>
    </div>
  );
}
