import { z } from "zod";
import { zerialize, type SzEnum, type SzObject, type SzType } from "zodex";
import { DATE_TIME_FORMAT } from "~/data/configs";
import { PaginatedRes } from "~/data/schemas/paginated-res";
import { Res } from "~/data/schemas/res";
import { TableColumnOptions } from "~/data/schemas/table";
import { SzDataType } from "~/data/types/basic";
import { dayjs } from "~/lib/dayjs";
import { assertIt } from "~/utils/primitive";

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

export function makeResMeta<TShape extends [string, ...string[]], TEnum extends z.ZodEnum<TShape>>(
  columnsNames: TEnum,
) {
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
    if (obj[k].type === SzDataType.STRING && typeof val === "string")
      where[k] = { contains: val, mode: "insensitive" };
    else if (obj[k].type === SzDataType.NUMBER && typeof val === "number")
      where[k] = { equals: val };
    else if (obj[k].type === "enum" && typeof val === "string")
      where[k] = val
        ? {
            in: val.split(".").filter((val) => (obj[k] as SzEnum<any>).values.includes(val)),
          }
        : undefined;
    else if (obj[k].type === SzDataType.DATE && typeof val === "string") {
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

export function getOptionsForMethodGetMany<
  TShape extends Record<string, z.ZodTypeAny>,
  TColMeta extends { [p in keyof TShape]?: TableColumnOptions | null },
>(
  outputItemsSchema: z.ZodObject<TShape>,
  generallySearchableColumns: (keyof TColMeta)[],
  columnsMeta: TColMeta,
) {
  const sortableColumns: (keyof TColMeta)[] = [];
  const filterableColumns: (keyof TColMeta)[] = [];
  const keys = Object.keys(columnsMeta) as (keyof TColMeta)[];

  keys.forEach((k) => {
    const m = columnsMeta[k];
    if (m?.filterable) filterableColumns.push(k);
    if (m?.sortable) sortableColumns.push(k);
  });

  const [k1, ...k2] = keys;
  assertIt(typeof k1 === "string");

  return {
    // TODO change function parameters to recieve filterable and sortable columns
    // instead of including them in columnsMeta
    columnsMeta: columnsMeta,
    sortableColumns: sortableColumns,
    filterableColumns: filterableColumns,
    generallySearchableColumns,
    outputSchema: makeResSchema(z.array(outputItemsSchema))
      .merge(PaginatedRes)
      .merge(
        makeResMeta(z.enum([k1, ...(k2 as unknown as Exclude<keyof TColMeta, number | symbol>[])])),
      ),
    outputItemsSchemaParsed: zerialize(outputItemsSchema),
  };
}
