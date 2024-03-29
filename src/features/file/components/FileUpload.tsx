import { useMutation } from "@tanstack/react-query";
import { Upload } from "antd";
import { useAtom } from "jotai";
import React from "react";
import { LuUpload } from "react-icons/lu";
import { type ApiFilePostResponseType } from "~/app/api/files/route";
import { globalMessage } from "~/components/configs/Providers/AntProvider";
import { FileTypesInfo } from "~/features/file/components/FileTypesInfo";
import { queryClient, rqMutation } from "~/lib/react-query";
import { globalLoadingAtom } from "~/store/atoms/global-loading";
import { fileNameExt } from "~/utils/primitive";
import { cn } from "~/utils/tailwind";

type Props = {
  className?: string;
  fileTypes?: string;
  hideFileTypesInfo?: boolean;
};

export const FileUpload = React.memo(function FileUpload({
  className,
  fileTypes,
  hideFileTypesInfo = false,
}: Props) {
  const [, setGlobalLoading] = useAtom(globalLoadingAtom);
  const { mutateAsync: deleteFile } = useMutation(
    rqMutation({ url: "/files/:id", invalidatedKeys: [["/files"]] }),
  );

  return (
    <Upload.Dragger
      accept={fileTypes}
      name="myFile"
      progress={{ className: "hidden" }}
      action="/api/files"
      className={cn("w-full", className)}
      showUploadList={{ showDownloadIcon: true, showRemoveIcon: true, showPreviewIcon: true }}
      beforeUpload={(f) => {
        const isValidExt = fileTypes?.split(",").includes(fileNameExt(f.name));
        if (isValidExt === false) void globalMessage.error("Invalid file type");
        return isValidExt ?? true;
      }}
      onChange={(info) => {
        if (info.file.status === "uploading") {
          setGlobalLoading(info.file.percent);
        } else {
          setGlobalLoading(null);
          if (info.file.status === "removed") {
            if (info.file.error || !info.file.response) return;
            const res = info.file.response.items as ApiFilePostResponseType["items"];
            deleteFile({ method: "DELETE", path: { id: res.id } }).then(
              () => globalMessage.success(`Deleted ${res.id}`),
              null,
            );
          } else if (info.file.status === "done") {
            void queryClient.invalidateQueries({ queryKey: ["/files"] });
            void globalMessage.success(`${info.file.name} uploaded successfully`);
            const res = info.file.response.items as ApiFilePostResponseType["items"];
            info.file.url = `/api/files/${res.id}`;
          } else if (info.file.status === "error") {
            void globalMessage.error(
              info.file.response.globalMessage || `${info.file.name} upload failed.`,
            );
          }
        }
      }}
    >
      <div className="flex flex-col gap-3 px-3">
        <div>
          <LuUpload className="align-sub text-lg" />
          &nbsp;&nbsp;
          <span className="text-lg font-normal">Click or drag file to Upload</span>
        </div>
        {!hideFileTypesInfo && (
          <FileTypesInfo fileTypes={fileTypes} className="flex-center-center" />
        )}
      </div>
    </Upload.Dragger>
  );
});
