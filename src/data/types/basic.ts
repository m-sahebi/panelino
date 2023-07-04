import { type HTTP_METHOD } from "next/dist/server/web/http";
import { type SzType } from "zodex";
import { type ObjectValues } from "~/utils/type";

export const SzDataType = {
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  NAN: "nan",
  BIGINT: "bigInt",
  DATE: "date",
  UNDEFINED: "undefined",
  NULL: "null",
  ANY: "any",
  UNKNOWN: "unknown",
  NEVER: "never",
  VOID: "void",

  LITERAL: "literal",
  ARRAY: "array",
  OBJECT: "object",
  UNION: "union",
  DISCRIMINATED_UNION: "discriminatedUnion",
  PROMISE: "promise",
  ENUM: "enum",
  FUNCTION: "function",
  SET: "set",
  MAP: "map",
  RECORD: "record",
  TUPLE: "tuple",
  INTERSECTION: "intersection",
} as const;
export type SzDataType = typeof SzDataType;

const _test: { type: ObjectValues<SzDataType> } = { type: "string" } as SzType;

export type HttpMethod = HTTP_METHOD;

export type HTMLElementTagName = keyof HTMLElementTagNameMap;
