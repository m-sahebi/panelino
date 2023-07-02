"use client";

import { Button } from "antd";
import React from "react";
import { FileBrowser } from "~/components/file/FileBrowser";
import { FileUpload } from "~/components/file/FileUpload";
import { modalFilePicker } from "~/components/modals/modalFilePicker";

export function FilesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <FileUpload />
      <FileBrowser />
      <Button
        onClick={() => {
          modalFilePicker({ onOk: console.log });
        }}
      >
        cl
      </Button>
    </div>
  );
}
