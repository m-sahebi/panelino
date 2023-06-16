"use client";

import { UploadButton } from "@uploadthing/react";
import { message } from "antd";
import { useState } from "react";
import { type UtFileRouter } from "~/_server/uploadthing";

export default function UploadthingPage() {
  const [src, setSrc] = useState<string>();
  return (
    <div className="flex min-h-screen flex-col items-center justify-between p-24">
      <img src={src} alt="" />
      <UploadButton<UtFileRouter>
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          setSrc(res?.[0].fileUrl);
          void message.success("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          void message.error(`ERROR! ${error.message}`);
        }}
      />
    </div>
  );
}
