"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { type PropsWithChildren } from "react";
import { queryClient } from "~/lib/tanstack-query";
import { trpcReact, trpcReactClient } from "~/lib/trpc";

export function TrpcProvider(p: PropsWithChildren) {
  return (
    <trpcReact.Provider client={trpcReactClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{p.children}</QueryClientProvider>
    </trpcReact.Provider>
  );
}
