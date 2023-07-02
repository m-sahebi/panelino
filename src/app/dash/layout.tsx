import { type PropsWithChildren } from "react";
import { PanelLayout } from "~/layouts/panel/PanelLayout";

export const metadata = {
  title: "Home",
};

export default async function DashLayout({ children }: PropsWithChildren) {
  return <PanelLayout>{children}</PanelLayout>;
}
