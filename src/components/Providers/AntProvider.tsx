"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, message, Modal, theme } from "antd";
import { useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useServerInsertedHTML } from "next/navigation";
import React, { useEffect, useState, type PropsWithChildren } from "react";
import { IS_SERVER } from "~/data/configs";
import { type MessageFactory, type ModalFactory } from "~/data/types/ant";
import { useDarkMode } from "~/hooks/useDarkMode";
import { rgbToHex } from "~/utils/primitive";

// suppress useLayoutEffect warnings when running outside a browser
// if (!process.browser) React.useLayoutEffect = React.useEffect;

export const globalColorPrimaryAtom = atomWithStorage(
  "globalColorPrimary",
  rgbToHex(
    ...((!IS_SERVER
      ? window.getComputedStyle(document.body).getPropertyValue("--color-primary")
      : "75 38 122"
    ).split(" ") as [string, string, string]),
  ),
);

export let globalModal: ModalFactory = Modal;
export let globalMessage: MessageFactory = message;

function ContextHolder() {
  const [styledModal, modalContextHolder] = Modal.useModal();
  const [styledMessage, messageContextHolder] = message.useMessage();

  if (globalModal !== styledModal) {
    globalModal = styledModal;
    globalMessage = styledMessage;
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
  const globalColorPrimary = useAtomValue(globalColorPrimaryAtom);

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
          colorPrimary: globalColorPrimary,
          fontFamily: "inherit",
          colorBgMask: darkMode ? "rgba(200, 200, 200, 0.35)" : "rgba(0, 0, 0, 0.45)",
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
