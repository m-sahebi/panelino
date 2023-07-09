"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, message, Modal, theme } from "antd";
import useMessage from "antd/es/message/useMessage";
import useModal from "antd/es/modal/useModal";
import { useServerInsertedHTML } from "next/navigation";
import React, { useEffect, useState, type PropsWithChildren } from "react";
import { IS_SERVER } from "~/data/configs";
import { type MessageFactory, type ModalFactory } from "~/data/types/component";
import { rgbToHex } from "~/utils/primitive";

// suppress useLayoutEffect warnings when running outside a browser
if (!process.browser) React.useLayoutEffect = React.useEffect;

const initDarkMode = !IS_SERVER && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
if (initDarkMode) document.documentElement.classList.add("dark");

const primaryColor = rgbToHex(
  ...((!IS_SERVER
    ? window.getComputedStyle(document.body).getPropertyValue("--color-primary")
    : "0, 0, 0"
  ).split(" ") as [string, string, string]),
);

export let globalModal: ModalFactory = Modal;
export let globalMessage: MessageFactory = message;
export function AntdProvider({ children }: PropsWithChildren) {
  const [modal, modalContextHolder] = useModal();
  const [message, messageContextHolder] = useMessage();
  if (globalModal === Modal) {
    globalModal = modal;
    globalMessage = message;
  }
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
          colorPrimary: primaryColor,
          fontFamily: "inherit",
        },
        algorithm: [isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm],
      }}
    >
      <StyleProvider hashPriority="high" cache={cache}>
        {modalContextHolder}
        {messageContextHolder}
        {children}
      </StyleProvider>
    </ConfigProvider>
  );
}
