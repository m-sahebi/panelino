"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme } from "antd";
import { useServerInsertedHTML } from "next/navigation";
import React, { useEffect, useState } from "react";
import { IS_SERVER } from "~/data/configs";

// suppress useLayoutEffect warnings when running outside a browser
if (!process.browser) React.useLayoutEffect = React.useEffect;

const initDarkMode = !IS_SERVER && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
if (initDarkMode) document.documentElement.classList.add("dark");

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => createCache());
  const [isDarkMode, setIsDarkMode] = useState(initDarkMode);
  const [isInit, setIsInit] = useState(false);

  useEffect(() => {
    setIsInit(true);
  }, []);

  useEffect(() => {
    const onDarkModeChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
      if (event.matches) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };
    window
      .matchMedia?.("(prefers-color-scheme: dark)")
      .addEventListener("change", onDarkModeChange);
    return () =>
      window
        .matchMedia?.("(prefers-color-scheme: dark)")
        .removeEventListener("change", onDarkModeChange);
  }, []);

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  if (!isInit) return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#00b96b",
          fontFamily: "inherit",
        },
        algorithm: [isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm],
      }}
    >
      <StyleProvider hashPriority="high" cache={cache}>
        {children}
      </StyleProvider>
    </ConfigProvider>
  );
}
