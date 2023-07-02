"use client";

import { useIsMutating } from "@tanstack/react-query";
import { useLayoutEffect, type PropsWithChildren } from "react";
import { createStateContext } from "react-use";
import { clamp } from "~/utils/primitive";

const [useGLobalLoadingState, GlobalStateLoadingProvider] = createStateContext<
  number | null | undefined
>(null);

export function useGlobalLoading(val?: number | null | undefined) {
  const [, setGlobalLoading] = useGLobalLoadingState();
  useLayoutEffect(() => {
    if (val !== undefined) setGlobalLoading(typeof val === "number" ? clamp(val, 0, 100) : val);
  }, [val, setGlobalLoading]);
  return { setGlobalLoading };
}

function InnerGlobalLoading() {
  const rqLoading = useIsMutating();
  const [globalLoading] = useGLobalLoadingState();

  const showRqLoading = !!rqLoading && !globalLoading;

  const color = "blue";

  return (
    <>
      <div
        style={{
          height: "3px",
          width: showRqLoading ? "100%" : "0",
          background: color,
          transition:
            "width 4s cubic-bezier(0.65, 0, 0.35, 1)," + " top .15s ease .2s, opacity .15s ease",
          position: "fixed",
          top: showRqLoading ? 0 : "-5px",
          left: 0,
          zIndex: 100001,
        }}
      >
        <div
          className={
            "absolute -right-0.5 -top-1.5 h-1 w-4" +
            " overflow-visible bg-transparent transition-shadow"
          }
          style={{
            boxShadow: rqLoading ? "0px 0 10px 3px rgba(42,142,255,0.75)" : "none",
          }}
        />
      </div>

      <div
        style={{
          height: "3px",
          width: (globalLoading ?? 0) + "%",
          background: color,
          transition: "width .6s ease .15s," + " top .15s ease, opacity .15s ease",
          position: "fixed",
          top: globalLoading ? 0 : "-5px",
          left: 0,
          zIndex: 100001,
        }}
      >
        <div
          className={
            "absolute -right-0.5 -top-1.5 h-1 w-4" +
            " overflow-visible bg-transparent transition-shadow"
          }
          style={{
            boxShadow: rqLoading ? "0px 0 10px 3px rgba(42,142,255,0.75)" : "none",
          }}
        />
      </div>

      <div
        style={{
          height: "3px",
          width: showRqLoading ? 0 : "100%",
          background: color,
          transition: "width .2s ease, top .15s ease .2s",
          position: "fixed",
          top: showRqLoading ? 0 : "-5px",
          left: 0,
          zIndex: 100002,
        }}
      />
    </>
  );
}

export function GlobalLoadingProvider({ children }: PropsWithChildren) {
  return (
    <GlobalStateLoadingProvider>
      <InnerGlobalLoading />
      {children}
    </GlobalStateLoadingProvider>
  );
}
