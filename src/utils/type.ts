type UnionToIntersectionFn<T> = (T extends unknown ? (k: () => T) => void : never) extends (
  k: infer Intersection,
) => void
  ? Intersection
  : never;
type GetUnionLast<T> = UnionToIntersectionFn<T> extends () => infer Last ? Last : never;
export type UnionToTuple<T, Tuple extends unknown[] = []> = [T] extends [never]
  ? Tuple
  : UnionToTuple<Exclude<T, GetUnionLast<T>>, [GetUnionLast<T>, ...Tuple]>;
type CastToStringTuple<T> = T extends [any, ...any[]] ? T : never;
export type UnionToTupleString<T> = CastToStringTuple<UnionToTuple<T>>;

export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type Nullish<T = null> = T | null | undefined;

export type Merge<T extends object, R extends object> = Omit<T, keyof R> & R;

export type UnionKeys<T> = T extends any ? keyof T : never;

export type ToString<T extends string | number | bigint | boolean | null | undefined> =
  T extends any ? `${T}` : never;

export type ObjectValues<T> = T[keyof T];
