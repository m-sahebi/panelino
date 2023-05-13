import {
  ZodBigIntDef,
  ZodBooleanDef,
  ZodDateDef,
  ZodEnumDef,
  ZodFirstPartyTypeKind,
  ZodNativeEnumDef,
  ZodNumberDef,
  ZodObject,
  ZodRawShape,
  ZodStringDef,
  ZodSymbolDef,
} from "zod";

export type ZodPrimitiveDef =
  | ZodStringDef
  | ZodNumberDef
  | ZodBigIntDef
  | ZodBooleanDef
  | ZodSymbolDef
  | ZodDateDef;

export { ZodFirstPartyTypeKind };

export function zModelOmitMeta<TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>
) {
  return schema.omit({ updatedAt: true, createdAt: true, deletedAt: true });
}

export function zModelOmitId<TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>
) {
  return schema.omit({ id: true });
}

export function zModelOmitIdAndMeta<TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>
) {
  return zModelOmitId(zModelOmitMeta(schema));
}

export function zGetSchemaKeysList<TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>
) {
  return schema.keyof().options;
}

export function zGetSchemaKeysListAndMeta<
  TSchema extends ZodRawShape,
  TKey extends keyof TSchema,
  TAcc extends {
    [key in TKey]: ZodPrimitiveDef | ZodNativeEnumDef | ZodEnumDef;
  }
>(schema: ZodObject<TSchema>) {
  const keysList = schema.keyof().options;

  const keysInfo = (keysList as TKey[]).reduce((acc, val) => {
    let def = schema.shape[val as any]._def;
    while (def.innerType) {
      def = def.innerType._def;
    }

    acc[val] = def as ZodPrimitiveDef | ZodNativeEnumDef | ZodEnumDef as any;
    return acc;
  }, {} as TAcc);

  type K = typeof keysList;
  return [keysList, keysInfo] as [
    K extends never ? string[] : K,
    K extends never
      ? { [k: string]: ZodPrimitiveDef | ZodNativeEnumDef | ZodEnumDef }
      : typeof keysInfo
  ];
}
