"use client";

import { UploadOutlined } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Upload } from "antd";
import React from "react";
import { type ApiFilePostResponseType } from "~/app/api/files/route";
import { FileBrowser } from "~/components/FileBrowser";
import { queryClient, rqMutation } from "~/lib/tanstack-query";

export function FilesPage() {
  const { mutateAsync: deleteFile } = useMutation(
    rqMutation({ url: "/files/:id", invalidatedKeys: [["/files"]] }),
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <Upload.Dragger
        name="myFile"
        action="/api/files"
        className="w-full truncate"
        showUploadList={{ showDownloadIcon: true, showRemoveIcon: true, showPreviewIcon: true }}
        onChange={(info) => {
          if ("removed" === info.file.status) {
            if (info.file.error) return;
            const res = info.file.response.items as ApiFilePostResponseType["items"];
            deleteFile({ method: "DELETE", path: { id: res.id } }).then(
              () => message.success(`Deleted ${res.id}`),
              (e: any) => message.error(e.toString()),
            );
          }
          if (info.file.status === "done") {
            void queryClient.invalidateQueries({ queryKey: ["/files"] });
            void message.success(`${info.file.name} uploaded successfully`);
            const res = info.file.response.items as ApiFilePostResponseType["items"];
            info.file.url = `/api/files/${res.id}`;
          } else if (info.file.status === "error") {
            void message.error(info.file.response.message || `${info.file.name} upload failed.`);
          }
        }}
      >
        <Button type="ghost" icon={<UploadOutlined />}>
          Click or drag file to Upload
        </Button>
      </Upload.Dragger>
      <FileBrowser />
    </div>
  );
}
