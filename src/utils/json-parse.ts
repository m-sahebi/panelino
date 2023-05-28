import { Primitive } from "zod";
import { Nullish } from "~/utils/type";

export function jsonParse<
  T extends Record<string, string | number | boolean | null | T[] | Record<string, T>>,
>(string: Nullish<string>, defaultVal?: T): T {
  try {
    return string ? JSON.parse(string) : defaultVal ?? ({} as T);
  } catch (e) {
    return defaultVal ?? ({} as T);
  }
}
