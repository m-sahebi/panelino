"use client";

import { Provider as JotaiProvider } from "jotai";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type PropsWithChildren } from "react";
import { DarkModeHandler } from "~/components/configs/DarkModeHandler";
import { AntProvider } from "~/components/configs/Providers/AntProvider";
import { TrpcProvider } from "~/components/configs/Providers/TrpcProvider";
import { GlobalLoading } from "~/components/GlobalLoading";
import { globalStore } from "~/store";

export function Providers({ children, session }: PropsWithChildren<{ session?: Session | null }>) {
  return (
    <JotaiProvider store={globalStore}>
      <TrpcProvider>
        <SessionProvider session={session}>
          <AntProvider>
            <GlobalLoading />
            <DarkModeHandler />
            {children}
          </AntProvider>
        </SessionProvider>
      </TrpcProvider>
    </JotaiProvider>
  );
}

/// TODO antd findDomNode console error workaround
// eslint-disable-next-line
const consoleError = console.error.bind(console);
// eslint-disable-next-line
console.error = (errObj, ...args) => {
  if (
    (process.env.NODE_ENV === "development" &&
      // typeof errObj.message === "string" &&
      args.includes("findDOMNode")) ||
    String(errObj).startsWith("Warning: Extra attributes from the server:")
  ) {
    return;
  }
  consoleError(errObj, ...args);
};
