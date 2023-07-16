import { diff as radashDiff } from "radash";
import { type Nullish, type UnionToTuple } from "~/utils/type";

export function fileNameExtSplit(fullName: string) {
  const idx = fullName.lastIndexOf(".");
  if (idx === -1) return [fullName, ""];
  const name = fullName.slice(0, idx);
  // file name is like `.example`
  if (!name) return [fullName, ""];
  return [name, fullName.slice(idx + 1)];
}

export function fileNameExt(fullName: string) {
  const idx = fullName.lastIndexOf(".");
  if (idx === -1) return "";
  const name = fullName.slice(0, idx);
  // file name is like `.example`
  if (!name) return "";
  return fullName.slice(idx);
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes == 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const capitalizeFirstLetter = (string: string) =>
  string && string[0].toUpperCase() + string.slice(1);

export const snakeCasePrettify = (string = "", capitalFirstLetter = true) =>
  capitalFirstLetter
    ? capitalizeFirstLetter(string.toLowerCase().split("_").join(" "))
    : string.replaceAll("_", " ");

export const camelCasePrettify = (text: string) =>
  capitalizeFirstLetter(text.replace(/([a-z0-9])([A-Z])/g, "$1 $2").toLowerCase());

export function toNumber(str: unknown): number | undefined;
export function toNumber(str: unknown, defaultValue: number): number;
export function toNumber(str: unknown, defaultValue: undefined): number | undefined;
export function toNumber(str: unknown, defaultValue: number | undefined = undefined) {
  if (!str) return defaultValue;

  const num = +str;
  if (Number.isNaN(num)) return defaultValue;

  return num;
}

export function clamp(value: number, min: number, max: number) {
  invariant(max >= min, `min value (${min}) is higher than max (${max})`);
  return Math.min(Math.max(value, min), max);
}

export function invariant(condition: any, errorMsg?: string): asserts condition {
  if (!condition) throw new Error(errorMsg || "assertion error");
}

export function nonNullable<T>(value: T, errorMsg?: string): NonNullable<T> {
  if (value == null) throw new Error(errorMsg || "value is null or undefined");
  return value;
}

/// Array and Object

export function inArray<TArr extends any[]>(arr: TArr, val: any): val is TArr[number] {
  return arr.includes(val);
}

export function arrayDiff<TArr extends any[], TVals extends readonly any[]>(
  arr: TArr,
  vals: TVals,
) {
  return radashDiff(arr, vals) as Exclude<TArr[number], TVals[number]>[];
}

export function jsonParse<
  T extends Record<string, string | number | boolean | null | T[] | Record<string, T>>,
>(string: Nullish<string>, defaultVal?: T): T {
  try {
    return string ? (JSON.parse(string) as any) : defaultVal ?? ({} as T);
  } catch (e) {
    return defaultVal ?? ({} as T);
  }
}

export function enumToArray<T>(en: T) {
  const arr = [] as UnionToTuple<keyof T>;
  for (const enumMember in en) {
    (arr as any).push(enumMember);
  }
  return arr;
}

export function windowClearSelection() {
  if (typeof window === "undefined") return;
  window.getSelection?.()?.removeAllRanges();
}

export function numberToHex(c: number | string) {
  const hex = (+c).toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(color: `${number} ${number} ${number}` | string) {
  return "#" + color.split(" ").map(numberToHex).join("");
}
