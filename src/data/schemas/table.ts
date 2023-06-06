import { listify } from "radash";
import { z } from "zod";
import { type UnionToTuple } from "~/utils/type";

export enum TableColumnType {
  STRING = "string",
  NUMBER = "number",
  DATE = "date",
  ENUM = "enum",
  BOOLEAN = "boolean",
}

export const TableColumnFilter = {
  [TableColumnType.STRING]: z.object({
    typeName: z.literal(TableColumnType.STRING),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  [TableColumnType.NUMBER]: z.object({
    typeName: z.literal(TableColumnType.NUMBER),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  [TableColumnType.DATE]: z.object({
    typeName: z.literal(TableColumnType.DATE),
    min: z.string().or(z.date()).optional(),
    max: z.string().or(z.date()).optional(),
  }),
  [TableColumnType.ENUM]: z.object({
    typeName: z.literal(TableColumnType.ENUM),
    values: z.array(z.string()),
  }),
  [TableColumnType.BOOLEAN]: z.object({
    typeName: z.literal(TableColumnType.BOOLEAN),
  }),
};
export type TableColumnFilter = {
  [p in TableColumnType]: z.infer<typeof TableColumnFilter[p]>;
};

export const TableColumnOptions = z.object({
  type: z
    .union(
      listify(TableColumnFilter, (k, v) => v) as UnionToTuple<
        typeof TableColumnFilter[TableColumnType]
      >,
    )
    .nullable(),
  title: z.string().optional(),
  filterable: z.boolean().optional(),
  sortable: z.boolean().optional(),
  mono: z.boolean().optional(),
  password: z.boolean().optional(),
});
export type TableColumnOptions = z.infer<typeof TableColumnOptions>;
