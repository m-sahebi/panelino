import { z } from "zod";
import { DATE_TIME_FORMAT } from "~/data/configs";
import { Res } from "~/data/schemas/res";
import { TableColumnOptions } from "~/data/schemas/table";
import { dayjs } from "~/lib/dayjs";
import { zodCreateUnionSchema, type ZodParsedDef } from "~/utils/zod";

export function makeResSchema<
  TShape extends z.ZodRawShape,
  TObject extends z.ZodArray<z.ZodObject<TShape>>,
>(
  dataSchema: TObject,
): z.ZodObject<
  typeof Res.shape & {
    items: TObject;
  }
>;
export function makeResSchema<TShape extends z.ZodRawShape, TObject extends z.ZodObject<TShape>>(
  dataSchema: TObject,
): z.ZodObject<
  typeof Res.shape & {
    items: TObject;
  }
>;
export function makeResSchema<TShape extends z.ZodRawShape, TObject extends z.ZodObject<TShape>>(
  dataSchema: TObject,
) {
  return Res.extend({ items: dataSchema });
}

export function makeResMeta<
  TShape extends [string, string, ...string[]],
  TEnum extends z.ZodEnum<TShape>,
>(columnsNames: TEnum) {
  return z.object({
    meta: z
      .object({
        columns: z.record(
          zodCreateUnionSchema(columnsNames._def.values),
          TableColumnOptions.nullable(),
        ),
      })
      .optional(),
  });
}

export function parseFilter(
  rawFilter: {
    [p: string]: unknown;
  },
  parsedOutputDef: ZodParsedDef<
    z.ZodTypeDef & {
      typeName?: z.ZodFirstPartyTypeKind;
    }
  >,
): Record<string, any> {
  const where: Record<string, any> = {};
  const obj = parsedOutputDef.obj;
  if (obj == null) return where;
  parsedOutputDef.keys!.forEach((k) => {
    const val = rawFilter[k];
    if (obj[k].typeName === z.ZodFirstPartyTypeKind.ZodString && typeof val === "string")
      where[k] = { contains: val, mode: "insensitive" };
    else if (obj[k].typeName === z.ZodFirstPartyTypeKind.ZodNumber && typeof val === "number")
      where[k] = { equals: val };
    else if (obj[k].typeName === z.ZodFirstPartyTypeKind.ZodNativeEnum && typeof val === "string")
      where[k] = val
        ? {
            in: val.split(".").filter((val) => (obj[k] as z.ZodNativeEnumDef).values[val]),
          }
        : undefined;
    else if (obj[k].typeName === z.ZodFirstPartyTypeKind.ZodDate && typeof val === "string") {
      const vals = val.split(".");
      const rawFrom = dayjs(vals[0], DATE_TIME_FORMAT);
      const from = rawFrom.isValid() ? rawFrom.toDate() : undefined;

      const rawTo = dayjs(vals[1], DATE_TIME_FORMAT);
      const to = rawTo.isValid() ? rawTo.toDate() : undefined;

      where[k] = { gte: from, lte: to };
    }
  });
  return where;
}
