import { ComponentPreview, Previews } from "@react-buddy/ide-toolbox-next";
import React from "react";
import { CustomDatePicker } from "~/components/CustomDatePicker";
import { GlobalSearch } from "~/components/GlobalSearch";
import { FileBrowser } from "~/features/file/components/FileBrowser";
import { ProfileIcon } from "~/features/user/components/ProfileIcon";
import { PaletteTree } from "~/lib/react-buddy/PaletteTree";

export default function ComponentPreviews() {
  return (
    <Previews palette={<PaletteTree />}>
      <ComponentPreview path="/ProfileIcon">
        <ProfileIcon />
      </ComponentPreview>
      <ComponentPreview path="/ComponentPreviews">
        <ComponentPreviews />
      </ComponentPreview>
      <ComponentPreview path="/GlobalSearch">
        <GlobalSearch />
      </ComponentPreview>
      <ComponentPreview path="/CustomDatePicker">
        <CustomDatePicker />
      </ComponentPreview>
      <ComponentPreview path="/FileBrowser">
        <FileBrowser />
      </ComponentPreview>
    </Previews>
  );
}
