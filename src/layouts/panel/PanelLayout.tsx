"use client";

import { type PropsWithChildren } from "react";
import { GlobalSearch } from "~/components/GlobalSearch";
import DashTitle from "~/layouts/panel/DashTitle";
import { Sidebar } from "~/layouts/panel/Sidebar";

type PanelLayoutProps = PropsWithChildren;
export function PanelLayout({ children }: PanelLayoutProps) {
  return (
    <>
      <GlobalSearch />
      <div className="relative mx-auto flex w-full max-w-[1440px]">
        <Sidebar />
        <main className="min-w-0 flex-1 px-6 py-4">
          <DashTitle />
          {children}
        </main>
      </div>
    </>
  );
}
