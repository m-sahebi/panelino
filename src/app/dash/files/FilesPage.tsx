"use client";

import { FileBrowser } from "~/components/file/FileBrowser";
import { FileUpload } from "~/components/file/FileUpload";
import { IMAGE_MEDIA_TYPE } from "~/data/configs";

export function FilesPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <FileUpload fileTypes={IMAGE_MEDIA_TYPE} />
      <FileBrowser multiSelect fileTypes={IMAGE_MEDIA_TYPE} />
    </div>
  );
}
