import { z } from "zod";
import { type SzEnum, type SzObject, type SzType } from "zodex";
import { DATE_TIME_FORMAT } from "~/data/configs";
import { Res } from "~/data/schemas/res";
import { PrimitiveType, TableColumnOptions } from "~/data/schemas/table";
import { dayjs } from "~/lib/dayjs";

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
        columns: z.record(columnsNames, TableColumnOptions.nullable()),
      })
      .optional(),
  });
}

export function parseFilter<T extends Record<string, SzType>>(
  rawFilter: {
    [p: string]: unknown;
  },
  parsedOutput: SzObject<T>,
): Record<string, any> {
  const where: Record<string, any> = {};
  const obj = parsedOutput.properties;
  if (obj == null) return where;
  const keys = Object.keys(parsedOutput.properties);
  keys.forEach((k) => {
    const val = rawFilter[k];
    if (obj[k].type === PrimitiveType.STRING && typeof val === "string")
      where[k] = { contains: val, mode: "insensitive" };
    else if (obj[k].type === PrimitiveType.NUMBER && typeof val === "number")
      where[k] = { equals: val };
    else if (obj[k].type === "enum" && typeof val === "string")
      where[k] = val
        ? {
            in: val.split(".").filter((val) => (obj[k] as SzEnum<any>).values.includes(val)),
          }
        : undefined;
    else if (obj[k].type === PrimitiveType.DATE && typeof val === "string") {
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
