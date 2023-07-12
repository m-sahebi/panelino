import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { IS_SERVER } from "~/data/configs";
import { DarkModeOptions, globalSettingsAtom } from "~/store/atoms/global-settings";

const initDarkMode = !IS_SERVER && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
if (initDarkMode) document.documentElement.classList.add("dark");

export function useDarkMode() {
  const globalSettings = useAtomValue(globalSettingsAtom);
  const [darkMode, setDarkMode] = useState(initDarkMode);
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const onDarkModeChange = (event?: MediaQueryListEvent, darkMode = false) => {
      const isDark = event?.matches ?? darkMode;
      setDarkMode(isDark);
      if (isDark) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };

    if (globalSettings.darkModeSetting === DarkModeOptions.ON) {
      onDarkModeChange(undefined, true);
      return;
    } else if (globalSettings.darkModeSetting === DarkModeOptions.OFF) {
      onDarkModeChange(undefined, false);
      return;
    } else onDarkModeChange(undefined, media.matches);

    media.addEventListener("change", onDarkModeChange);
    return () => media.removeEventListener("change", onDarkModeChange);
  }, [globalSettings.darkModeSetting]);
  return { darkMode };
}