import { diff as radashDiff } from "radash";
import { type Nullish, type UnionToTuple } from "~/utils/type";

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

export function assertIt(condition: any, errorMsg?: string): asserts condition {
  if (!condition) throw new Error(errorMsg || "assertion error");
}

export function getNonNullable<T>(value: T, errorMsg?: string): NonNullable<T> {
  if (value == null) throw new Error(errorMsg || "assertion error");
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
    return string ? JSON.parse(string) : defaultVal ?? ({} as T);
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
