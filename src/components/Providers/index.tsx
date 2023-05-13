"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { AntdProvider } from "@/components/Providers/AntdProvider";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <AntdProvider>{children}</AntdProvider>
    </SessionProvider>
  );
}
