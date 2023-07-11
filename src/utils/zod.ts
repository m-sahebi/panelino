import { z, type Primitive } from "zod";

export type ZodPrimitiveDef =
  | z.ZodStringDef
  | z.ZodNumberDef
  | z.ZodBigIntDef
  | z.ZodBooleanDef
  | z.ZodSymbolDef
  | z.ZodDateDef;

export type ZodMainDef = ZodPrimitiveDef | z.ZodNativeEnumDef | z.ZodEnumDef | z.ZodUnionDef;

////
type MappedZodLiterals<T extends readonly Primitive[]> = {
  -readonly [K in keyof T]: z.ZodLiteral<T[K]>;
};
function zodCreateManyUnion<A extends Readonly<[Primitive, Primitive, ...Primitive[]]>>(
  literals: A,
) {
  return z.union(literals.map((value) => z.literal(value)) as MappedZodLiterals<A>);
}

function zodCreateUnionSchema<T extends readonly []>(values: T): z.ZodNever;
function zodCreateUnionSchema<T extends readonly [Primitive]>(values: T): z.ZodLiteral<T[0]>;
function zodCreateUnionSchema<T extends readonly [Primitive, Primitive, ...Primitive[]]>(
  values: T,
): z.ZodUnion<MappedZodLiterals<T>>;
function zodCreateUnionSchema<T extends readonly Primitive[]>(values: T) {
  if (values.length > 1) {
    return zodCreateManyUnion(values as typeof values & [Primitive, Primitive, ...Primitive[]]);
  }
  if (values.length === 1) {
    return z.literal(values[0]);
  }
  if (values.length === 0) {
    return z.never();
  }
  throw new Error("Array must have a length");
}

export { zodCreateUnionSchema };
