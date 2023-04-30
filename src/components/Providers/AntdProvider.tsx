'use client';

import React, { useEffect, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs';
import { ConfigProvider, theme } from 'antd';

// suppress useLayoutEffect warnings when running outside a browser
if (!process.browser) React.useLayoutEffect = React.useEffect;

const initDarkMode =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches;

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
    };
    window
      .matchMedia?.('(prefers-color-scheme: dark)')
      .addEventListener('change', onDarkModeChange);
    return () =>
      window
        .matchMedia?.('(prefers-color-scheme: dark)')
        .removeEventListener('change', onDarkModeChange);
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
        token: { colorPrimary: '#00b96b' },
        algorithm: [isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm],
      }}
    >
      <StyleProvider hashPriority="high" cache={cache}>
        {children}
      </StyleProvider>
    </ConfigProvider>
  );
}
