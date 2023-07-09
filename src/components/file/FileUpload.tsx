import { UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "antd";
import React from "react";
import { type ApiFilePostResponseType } from "~/app/api/files/route";
import { useGlobalLoading } from "~/components/GlobalLoading";
import { globalMessage } from "~/components/Providers/AntdProvider";
import { queryClient, rqMutation } from "~/lib/tanstack-query";
import { cn } from "~/utils/tailwind";

export const FileUpload = React.memo(function FileUpload({ className }: { className?: string }) {
  const { setGlobalLoading } = useGlobalLoading();
  const { mutateAsync: deleteFile } = useMutation(
    rqMutation({ url: "/files/:id", invalidatedKeys: [["/files"]] }),
  );

  return (
    <Upload.Dragger
      name="myFile"
      progress={{ className: "hidden" }}
      action="/api/files"
      className={cn("w-full", className)}
      showUploadList={{ showDownloadIcon: true, showRemoveIcon: true, showPreviewIcon: true }}
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
              (e: any) => globalMessage.error(e.toString()),
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
      <UploadOutlined className="text-lg text-daw-primary" />
      &nbsp;&nbsp;
      <span className="text-lg font-normal">Click or drag file to Upload</span>
    </Upload.Dragger>
  );
});
