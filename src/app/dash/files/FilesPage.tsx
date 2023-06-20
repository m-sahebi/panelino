"use client";

import { UploadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, message, Slider, Upload } from "antd";
import React, { useState } from "react";
import { type ApiFilePostResponseType, type ApiFilesGetResponseType } from "~/app/api/files/route";
import { queryClient } from "~/lib/tanstack-query";

export function FilesPage() {
  const [zoom, setZoom] = useState(70);
  const { data } = useQuery<ApiFilesGetResponseType>({ queryKey: ["/files"] });
  console.log({ data });
  return (
    <div className="flex w-full flex-col gap-6">
      <Upload.Dragger
        name="myFile"
        action="/api/files"
        // listType="picture"
        showUploadList={{ showDownloadIcon: true, showRemoveIcon: true, showPreviewIcon: true }}
        accept=".png,.jpg,.jpeg,.webp,.gif"
        onChange={(info) => {
          if (["removed"].includes(info.file.status as string)) {
            const res = info.file.response.items as ApiFilePostResponseType["items"];
            console.log("REMOVE", res);
            fetch(`/api/files/${res.id}`, { method: "DELETE" }).then(
              () => {
                void message.success(`Deleted ${res.id}`);
                void queryClient.invalidateQueries({ queryKey: ["/files"] });
              },
              (e: any) => message.error(e.toString()),
            );
          }
          if (info.file.status === "done") {
            void queryClient.invalidateQueries({ queryKey: ["/files"] });
            void message.success(`${info.file.name} uploaded successfully`);
            const res = info.file.response.items as ApiFilePostResponseType["items"];
            info.file.url = `/api/files/${res.id}`;
            console.log("DONE", res, info.file);
          } else if (info.file.status === "error") {
            void message.error(info.file.response.message || `${info.file.name} upload failed.`);
          }
        }}
      >
        <Button type="ghost" icon={<UploadOutlined />}>
          Click or drag file to Upload
        </Button>
      </Upload.Dragger>
      <div className="flex items-center gap-3">
        Zoom:
        <Slider className="flex-1" min={40} max={300} value={zoom} onChange={setZoom} />
      </div>
      <div
        className="grid w-full place-content-center place-items-center justify-between"
        style={{
          // counterReset: "tile-item",
          gridTemplateColumns: `repeat(auto-fit, minmax(${zoom / 10}rem, 1fr))`,
          gridGap: "1rem 1rem",
        }}
      >
        {data?.items.map((file) => (
          <div
            className="flex w-full flex-col gap-4"
            key={file.id}
            style={{
              height: `calc(${zoom / 10}rem + 4rem)`,
            }}
          >
            <div
              className="flex w-full items-center justify-center"
              style={{
                height: `${zoom / 10}rem`,
              }}
            >
              <img
                src={`/api/files/${file.id}`}
                alt={file.key}
                className="max-h-full max-w-full rounded object-contain"
              />
            </div>
            <span
              title={file.id + "." + file.key.split(".").at(-1)}
              className="flex w-full justify-center text-xs font-normal"
            >
              <span className="max-w-full flex-shrink truncate">{file.id}</span>.
              {file.key.split(".").at(-1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
