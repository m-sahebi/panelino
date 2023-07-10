"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, message, Modal, theme } from "antd";
import useMessage from "antd/es/message/useMessage";
import useModal from "antd/es/modal/useModal";
import { useServerInsertedHTML } from "next/navigation";
import React, { useEffect, useState, type PropsWithChildren } from "react";
import { IS_SERVER } from "~/data/configs";
import { type MessageFactory, type ModalFactory } from "~/data/types/ant";
import { useDarkMode } from "~/hooks/useDarkMode";
import { rgbToHex } from "~/utils/primitive";

// suppress useLayoutEffect warnings when running outside a browser
if (!process.browser) React.useLayoutEffect = React.useEffect;

export const primaryColor = rgbToHex(
  ...((!IS_SERVER
    ? window.getComputedStyle(document.body).getPropertyValue("--color-primary")
    : "0, 0, 0"
  ).split(" ") as [string, string, string]),
);

export let globalModal: ModalFactory = Modal;
export let globalMessage: MessageFactory = message;
function ContextHolder() {
  const [modal, modalContextHolder] = useModal();
  const [message, messageContextHolder] = useMessage();
  if (globalModal !== modal) {
    globalModal = modal;
    globalMessage = message;
  }

  return (
    <>
      {modalContextHolder}
      {messageContextHolder}
    </>
  );
}

export function AntProvider({ children }: PropsWithChildren) {
  const { darkMode } = useDarkMode();
  const [cache] = useState(() => createCache());

  const [isInit, setIsInit] = useState(false);
  useEffect(() => {
    setIsInit(true);
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
        algorithm: [darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm],
      }}
    >
      <StyleProvider hashPriority="high" cache={cache}>
        <ContextHolder />
        {children}
      </StyleProvider>
    </ConfigProvider>
  );
}
