import { omit, pick, shake } from "radash";
import { z, ZodFirstPartyTypeKind, type Primitive } from "zod";
import { type Merge, type UnionToTuple } from "~/utils/type";

export type ZodPrimitiveDef =
  | z.ZodStringDef
  | z.ZodNumberDef
  | z.ZodBigIntDef
  | z.ZodBooleanDef
  | z.ZodSymbolDef
  | z.ZodDateDef;

export type ZodMainDef = ZodPrimitiveDef | z.ZodNativeEnumDef | z.ZodEnumDef | z.ZodUnionDef;

export { ZodFirstPartyTypeKind };

export type ZodParsedDef<TDef extends z.ZodTypeDef = z.ZodTypeDef> = Omit<TDef, "errorMap"> & {
  keys?: string[];
  obj?: { [p: string]: ZodParsedDef<TDef> };
  arr?: ZodParsedDef<TDef>;
  optional?: boolean;
  nullable?: boolean;
  nullish?: boolean;
};

export type ZodParseDef<TDef extends ZodParsedDef> = TDef extends {
  innerType: { _def: z.ZodTypeDef };
}
  ? ZodParseDef<
      Merge<
        { optional: undefined; nullable: undefined; nullish: undefined },
        Merge<
          Omit<TDef["innerType"]["_def"], "errorMap">,
          TDef extends z.ZodNullableDef
            ? {
                nullable: true;
                nullish: true;
                optional: TDef["optional"] extends boolean ? TDef["optional"] : undefined;
              }
            : TDef extends z.ZodOptionalDef
            ? {
                optional: true;
                nullish: true;
                nullable: TDef["nullable"] extends boolean ? TDef["nullable"] : undefined;
              }
            : object
        >
      >
    >
  : TDef extends z.ZodObjectDef
  ? {
      keys: UnionToTuple<keyof ReturnType<TDef["shape"]>>;
      obj: {
        [key in keyof ReturnType<TDef["shape"]>]: ZodParseDef<
          ReturnType<TDef["shape"]>[key]["_def"]
        >;
      };
      optional: TDef["optional"];
      nullable: TDef["nullable"];
      nullish: TDef["nullish"];
    }
  : TDef extends z.ZodArrayDef
  ? {
      arr: ZodParseDef<TDef["type"]["_def"]>;
      optional: TDef["optional"];
      nullable: TDef["nullable"];
      nullish: TDef["nullish"];
    }
  : TDef extends z.ZodUnionDef
  ? {
      options: UnionToTuple<TDef["options"][number]["_def"]>;
      optional: TDef["optional"];
      nullable: TDef["nullable"];
      nullish: TDef["nullish"];
    }
  : TDef;

function _zodParseDef<
  TDef extends z.ZodTypeDef & {
    keys?: string[];
    obj?: { [p: string]: TDef };
    arr?: TDef;
    optional?: true;
    nullable?: true;
    nullish?: true;
  },
>(def: TDef): any {
  const get = _zodParseDef as any;
  const d = def as any;
  if ("innerType" in def) {
    const optional = d.typeName === ZodFirstPartyTypeKind.ZodOptional || def.optional;
    const nullable = d.typeName === ZodFirstPartyTypeKind.ZodNullable || def.nullable;
    const nullish = optional || nullable;
    const description = d.description ?? d.innerType._def.description;

    return get({
      ...omit(d.innerType._def, ["errorMap"]),
      ...shake({ optional, nullable, nullish, description }, (v) => !v),
    } as any);
  }

  if (d.typeName === ZodFirstPartyTypeKind.ZodObject) {
    const shape = d.shape();
    const keys = Object.keys(shape);
    return {
      keys,
      obj: keys.reduce((acc, key) => {
        acc[key] = get(shape[key]._def);
        return acc;
      }, {} as any),
      ...pick(def, [
        (def.optional && "optional") as any,
        (def.nullable && "nullable") as any,
        (def.nullish && "nullish") as any,
      ]),
    } as any;
  }

  if (d.typeName === ZodFirstPartyTypeKind.ZodArray) {
    return {
      arr: get(d["type"]["_def"]),
      ...pick(def, [
        (def.optional && "optional") as any,
        (def.nullable && "nullable") as any,
        (def.nullish && "nullish") as any,
      ]),
    } as any;
  }

  if (d.typeName === ZodFirstPartyTypeKind.ZodUnion) {
    return {
      options: d.options.map((el: any) => el._def),
      ...pick(def, [
        (def.optional && "optional") as any,
        (def.nullable && "nullable") as any,
        (def.nullish && "nullish") as any,
      ]),
    } as any;
  }

  return def as any;
}

export function zodParseDef<TDef extends z.ZodTypeDef = z.ZodTypeDef>(def: TDef) {
  return _zodParseDef(def) as ZodParseDef<TDef>;
}

type MappedZodLiterals<T extends readonly Primitive[]> = {
  -readonly [K in keyof T]: z.ZodLiteral<T[K]>;
};

////
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
