import { atomWithStorage } from "jotai/utils";

export const dashSidebarAtom = atomWithStorage("dashSidebarAtom", { collapsed: false });
