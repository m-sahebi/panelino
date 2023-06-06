"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { AntdProvider } from "~/components/Providers/AntdProvider";
import { TrpcProvider } from "~/components/Providers/TrpcProvider";

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <TrpcProvider>
      <SessionProvider session={session}>
        <AntdProvider>{children}</AntdProvider>
      </SessionProvider>
    </TrpcProvider>
  );
}
