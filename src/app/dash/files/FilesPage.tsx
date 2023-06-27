"use client";

import { FileOutlined, UploadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, message, Slider, Upload } from "antd";
import Image from "next/image";
import React, { useState } from "react";
import { type ApiFilePostResponseType, type ApiFilesGetResponseType } from "~/app/api/files/route";
import { queryClient } from "~/lib/tanstack-query";
import { fileNameExtSplit } from "~/utils/primitive";

export function FilesPage() {
  const [zoom, setZoom] = useState(70);
  const { data } = useQuery<ApiFilesGetResponseType>({ queryKey: ["/files"] });

  return (
    <div className="flex w-full flex-col gap-6">
      <Upload.Dragger
        name="myFile"
        action="/api/files"
        className="w-full truncate"
        // listType="picture"
        showUploadList={{ showDownloadIcon: true, showRemoveIcon: true, showPreviewIcon: true }}
        // accept=".png,.jpg,.jpeg,.webp,.gif"
        onChange={(info) => {
          if ("removed" === info.file.status) {
            if (info.file.error) return;
            const res = info.file.response.items as ApiFilePostResponseType["items"];
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
        <Slider
          className="max-w-[12rem] flex-1"
          min={40}
          max={300}
          step={10}
          value={zoom}
          onChange={setZoom}
        />
      </div>
      <div
        className="grid w-full place-content-center place-items-center justify-between"
        style={{
          // counterReset: "tile-item",
          gridTemplateColumns: `repeat(auto-fit, minmax(${zoom / 10}rem, 1fr))`,
          gridGap: "1rem 1rem",
        }}
      >
        {data?.items.map((file) => {
          const [name, ext] = fileNameExtSplit(file.name);
          return (
            <div
              className="flex w-full flex-col gap-4"
              key={file.id}
              style={{
                height: `calc(${zoom / 10}rem + 4rem)`,
              }}
            >
              <div
                className="flex w-full items-center justify-center"
                style={{ height: `${zoom / 10}rem` }}
              >
                <a href={`/api/files/${file.id}`} target="_blank">
                  {file.mimeType?.startsWith("image") ? (
                    <Image
                      width={zoom * 1.6}
                      height={zoom * 1.6}
                      src={`/api/files/${file.id}`}
                      alt={file.key}
                      className="max-h-full max-w-full rounded object-contain"
                    />
                  ) : (
                    <FileOutlined
                      className="text-daw-blue-500"
                      style={{ fontSize: `${zoom / 14}rem` }}
                    />
                  )}
                </a>
              </div>
              <span
                title={file.id + "." + file.key.split(".").at(-1)}
                className="flex w-full justify-center text-xs font-normal"
              >
                <span className="max-w-full flex-shrink truncate">{name}</span>.{ext}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
