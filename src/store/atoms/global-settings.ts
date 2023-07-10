import { atomWithStorage } from "jotai/utils";
import { type ObjectValues } from "~/utils/type";

export const DarkModeOptions = { SYSTEM: "system", ON: "on", OFF: "off" } as const;
export type DarkModeOptions = typeof DarkModeOptions;
export const DarkModeOptionsList = Object.values(
  DarkModeOptions,
) as ObjectValues<DarkModeOptions>[];

export const globalSettingsAtom = atomWithStorage("globalSettings", {
  darkModeSetting: "system" as ObjectValues<DarkModeOptions>,
});
