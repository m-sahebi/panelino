"use client";

import { FileBrowser } from "~/components/file/FileBrowser";
import { FileUpload } from "~/components/file/FileUpload";

export function FilesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <FileUpload />
      <FileBrowser multiSelect />
    </div>
  );
}
