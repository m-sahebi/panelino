"use client";

import { type PropsWithChildren } from "react";
import { GlobalSearchProvider } from "~/components/GlobalSearch";
import DashTitle from "~/layouts/panel/DashTitle";
import { Sidebar } from "~/layouts/panel/Sidebar";

type PanelLayoutProps = PropsWithChildren;
function InnerPanelLayout({ children }: PanelLayoutProps) {
  return (
    <div className="relative mx-auto flex w-full max-w-[1440px]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-6 pt-4">
        <DashTitle />
        {children}
      </main>
    </div>
  );
}

export function PanelLayout({ children, ...p }: PanelLayoutProps) {
  return (
    <GlobalSearchProvider>
      <InnerPanelLayout {...p}>{children}</InnerPanelLayout>
    </GlobalSearchProvider>
  );
}
