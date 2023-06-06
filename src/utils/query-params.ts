import qs from "query-string";
import { mapValues } from "radash";

export function queryParamsParse(string: string) {
  return mapValues(qs.parse(string), (v) => (v === null ? true : v));
}

export function queryParamsStringify<T extends Record<string, any>>(params: T) {
  return qs.stringify(
    mapValues(params, (v) => (v === true ? null : v === null || v === false ? undefined : v)),
  );
}
