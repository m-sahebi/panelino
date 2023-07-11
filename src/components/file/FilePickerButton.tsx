import { Button, Tag } from "antd";
import { useState } from "react";
import { modalFilePicker } from "~/components/modals/modalFilePicker";
import { type FileModel } from "~/data/models/file";

export function FilePickerButton({
  onChange,
  value,
}: {
  onChange?: (fileId: string | undefined) => void;
  value?: string | undefined;
}) {
  const [selectedFile, setSelectedFile] = useState<FileModel>();
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        onClick={() =>
          modalFilePicker({
            multiSelect: false,
            onOk: ([id], [file]) => {
              setSelectedFile(file);
              onChange?.(id);
            },
          })
        }
      >
        Choose file
      </Button>
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
