import { diff as radashDiff } from "radash";

export function inArray<TArr extends any[]>(arr: TArr, val: any): val is TArr[number] {
  return arr.includes(val);
}

export function arrayDiff<TArr extends any[], TVals extends readonly any[]>(
  arr: TArr,
  vals: TVals,
) {
  return radashDiff(arr, vals) as Exclude<TArr[number], TVals[number]>[];
}
