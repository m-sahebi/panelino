import React from "react";
import PanelLayout from "~/layouts/panel/PanelLayout";

export const metadata = {
  title: "Home",
};

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  return <PanelLayout>{children}</PanelLayout>;
}
