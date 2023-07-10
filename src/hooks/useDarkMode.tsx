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
    const onDarkModeChange = (event?: MediaQueryListEvent, darkMode = false) => {
      console.log("CHANGE", event?.matches, darkMode);
      setDarkMode(event?.matches ?? darkMode);
      if (event?.matches ?? darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };

    if (globalSettings.darkMode === DarkModeOptions.ON) {
      onDarkModeChange(undefined, true);
      return;
    } else if (globalSettings.darkMode === DarkModeOptions.OFF) {
      onDarkModeChange(undefined, false);
      return;
    } else onDarkModeChange(undefined, window.matchMedia?.("(prefers-color-scheme: dark)").matches);

    window
      .matchMedia?.("(prefers-color-scheme: dark)")
      .addEventListener("change", onDarkModeChange);
    return () =>
      window
        .matchMedia?.("(prefers-color-scheme: dark)")
        .removeEventListener("change", onDarkModeChange);
  }, [globalSettings.darkMode]);
  return { darkMode };
}
