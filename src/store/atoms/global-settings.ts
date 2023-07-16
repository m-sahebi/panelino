import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import sassVars from "~/assets/styles/vars.module.scss";
import { INIT_DARK_MODE, IS_SERVER } from "~/data/configs";
import { type ObjectValues } from "~/utils/type";

export const DarkModeOptions = { SYSTEM: "system", ON: "on", OFF: "off" } as const;
export type DarkModeOptions = typeof DarkModeOptions;
export const DarkModeOptionsList = Object.values(
  DarkModeOptions,
) as ObjectValues<DarkModeOptions>[];

const initialState = {
  darkModeSetting: "system" as ObjectValues<DarkModeOptions>,
  colorPrimaryLight: sassVars.colorPrimaryLight,
  colorPrimaryDark: sassVars.colorPrimaryDark,
};
export const globalSettingsAtom = atomWithStorage("globalSettingsAtom", initialState);

/**
 * Global dark mode handler
 * */
export const darkModeMediaAtom = atom(INIT_DARK_MODE);
export const globalDarkModeAtom = atom((get) => {
  if (IS_SERVER) return INIT_DARK_MODE;
  const setting = get(globalSettingsAtom).darkModeSetting;
  if (setting === "system") return get(darkModeMediaAtom); //darkModeMedia.matches
  return setting === "on";
});

/**
 * Global primary color handler
 * */
export const globalColorPrimary = atom((get) => {
  return get(globalDarkModeAtom)
    ? get(globalSettingsAtom).colorPrimaryDark
    : get(globalSettingsAtom).colorPrimaryLight;
});
