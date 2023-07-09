"use client";

import { DevSupport } from "@react-buddy/ide-toolbox-next";
import { type PropsWithChildren } from "react";
import { Direct } from "~/components/Direct";
import { IS_DEV } from "~/data/configs";
import { useInitial } from "~/lib/react-buddy";
import ComponentPreviews from "~/lib/react-buddy/ComponentPreviews";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <DevSupport devmode={IS_DEV} ComponentPreviews={ComponentPreviews} useInitialHook={useInitial}>
      <Direct>{children}</Direct>
    </DevSupport>
  );
}
