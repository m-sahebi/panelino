import { atom } from "jotai";
import { type Nullish } from "~/utils/type";

export const globalLoadingAtom = atom(null as Nullish<number>);
