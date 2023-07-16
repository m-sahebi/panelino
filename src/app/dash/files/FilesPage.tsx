"use client";

import { IMAGE_MEDIA_TYPE } from "~/data/configs";
import { FileBrowser } from "~/features/file/components/FileBrowser";
import { FileUpload } from "~/features/file/components/FileUpload";

export function FilesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <FileUpload fileTypes={IMAGE_MEDIA_TYPE} />
      <FileBrowser multiSelect fileTypes={IMAGE_MEDIA_TYPE} />
    </div>
  );
}
