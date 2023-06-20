"use client";

import { useIsMutating } from "@tanstack/react-query";

export default function PageLoading() {
  const loading = useIsMutating();

  return (
    <>
      <div
        style={{
          height: "3px",
          width: loading ? "100%" : "0",
          background: "blue",
          transition:
            "width 4s cubic-bezier(0.65, 0, 0.35, 1)," + " top .15s ease .2s, opacity .15s ease",
          position: "fixed",
          top: loading ? 0 : "-5px",
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
            boxShadow: loading ? "0px 0 10px 3px rgba(42,142,255,0.75)" : "none",
          }}
        />
      </div>
      <div
        style={{
          height: "3px",
          width: loading ? 0 : "100%",
          background: "blue",
          transition: "width .2s ease, top .15s ease .2s",
          position: "fixed",
          top: loading ? 0 : "-5px",
          left: 0,
          zIndex: 100002,
        }}
      />
    </>
  );
}
