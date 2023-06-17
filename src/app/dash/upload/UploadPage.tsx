"use client";

import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload, type UploadProps } from "antd";
import Image from "next/image";
import React, { useState } from "react";

const props: UploadProps = {
  name: "myFile",
  action: "/api/files",
};

export function UploadPage({ token }: { token?: string }) {
  const [imageName, setImageName] = useState<string>();
  return (
    <div className="flex flex-col gap-6">
      {imageName && <Image className="w-full" src={`/api/files/${imageName}`} alt="kossher" />}
      <Upload
        {...props}
        headers={token ? { Authorization: token } : undefined}
        onChange={(info) => {
          if (info.file.status !== "uploading") {
            console.log(info.file, info.fileList);
          }
          if (info.file.status === "done") {
            void message.success(`${info.file.name} uploaded successfully`);
            console.log(info.file.response);
            setImageName(info.file.response.id);
          } else if (info.file.status === "error") {
            void message.error(info.file.response.message || `${info.file.name} upload failed.`);
          }
        }}
      >
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
    </div>
  );
}
