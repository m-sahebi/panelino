"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, message, Modal, theme } from "antd";
import { useAtomValue } from "jotai";
import { useServerInsertedHTML } from "next/navigation";
import React, { useState, type PropsWithChildren } from "react";
import { type MessageFactory, type ModalFactory } from "~/data/types/ant";
import { globalColorPrimary, globalDarkModeAtom } from "~/store/atoms/global-settings";
import { rgbToHex } from "~/utils/primitive";

// suppress useLayoutEffect warnings when running outside a browser
// if (!process.browser) React.useLayoutEffect = React.useEffect;

export let globalModal: ModalFactory = Modal;
export let globalMessage: MessageFactory = message;

function ModalContextHolder() {
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
  const [cache] = useState(() => createCache());
  const colorPrimary = rgbToHex(useAtomValue(globalColorPrimary));
  const darkMode = useAtomValue(globalDarkModeAtom);

  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `</script>${extractStyle(cache)}<script>`,
        }}
      />
    );
  });

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary,
          fontFamily: "inherit",
          colorBgMask: darkMode ? "rgba(200, 200, 200, 0.35)" : "rgba(0, 0, 0, 0.45)",
        },
        algorithm: [darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm],
      }}
    >
      <StyleProvider hashPriority="high" cache={cache}>
        <ModalContextHolder />
        {children}
      </StyleProvider>
    </ConfigProvider>
  );
}
