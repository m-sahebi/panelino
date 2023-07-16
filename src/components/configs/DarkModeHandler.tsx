import { useAtom, useAtomValue } from "jotai";
import { useEffect } from "react";
import { IS_SERVER } from "~/data/configs";
import { globalStore } from "~/store";
import {
  darkModeMediaAtom,
  DarkModeOptions,
  globalSettingsAtom,
} from "~/store/atoms/global-settings";
import { invariant } from "~/utils/primitive";

const darkModeHTMLMedia = !IS_SERVER && window.matchMedia("(prefers-color-scheme: dark)");
const setDarkMode = (enable = false) => {
  if (enable) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
};
const handleDarkModeMediaChange = (event: MediaQueryListEvent) => {
  globalStore.set(darkModeMediaAtom, event.matches);
};

export function DarkModeHandler() {
  const { darkModeSetting } = useAtomValue(globalSettingsAtom);
  const [darkModeMedia, setDarkModeMedia] = useAtom(darkModeMediaAtom);

  useEffect(() => {
    invariant(darkModeHTMLMedia);
    setDarkModeMedia(darkModeHTMLMedia.matches);
    darkModeHTMLMedia.addEventListener("change", handleDarkModeMediaChange);
    return () => darkModeHTMLMedia.removeEventListener("change", handleDarkModeMediaChange);
  }, [setDarkModeMedia]);

  useEffect(() => {
    invariant(darkModeHTMLMedia);
    if (darkModeSetting === DarkModeOptions.ON) {
      setDarkMode(true);
      return;
    } else if (darkModeSetting === DarkModeOptions.OFF) {
      setDarkMode(false);
      return;
    } else setDarkMode(darkModeMedia);
  }, [darkModeSetting, darkModeMedia]);
  return null;
}
