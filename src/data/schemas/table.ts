import { listify } from "radash";
import { z } from "zod";
import { type SzEnum } from "zodex";
import { type SzDate, type SzNumber, type SzPrimitive, type SzString } from "zodex/dist/types";
import { type SzDataType } from "~/data/types/basic";
import { type ObjectValues, type ToString, type UnionToTuple } from "~/utils/type";

export enum TableColumnType {
  STRING = "string",
  NUMBER = "number",
  DATE = "date",
  ENUM = "enum",
  BOOLEAN = "boolean",
}
const _test: ObjectValues<SzDataType> = {} as ToString<TableColumnType>;

export const TableColumnFilter = {
  [TableColumnType.STRING]: z.object({
    type: z.literal(`${TableColumnType.STRING}`),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  [TableColumnType.NUMBER]: z.object({
    type: z.literal(`${TableColumnType.NUMBER}`),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  [TableColumnType.DATE]: z.object({
    type: z.literal(`${TableColumnType.DATE}`),
    min: z.number().optional(),
    max: z.number().optional(),
  }),
  [TableColumnType.ENUM]: z.object({
    type: z.literal(`${TableColumnType.ENUM}`),
    values: z.array(z.string().or(z.number())),
  }),
  [TableColumnType.BOOLEAN]: z.object({
    type: z.literal(`${TableColumnType.BOOLEAN}`),
  }),
};
const _s: z.infer<(typeof TableColumnFilter)[TableColumnType.STRING]> = {} as SzString;
const _n: z.infer<(typeof TableColumnFilter)[TableColumnType.NUMBER]> = {} as SzNumber;
const _d: z.infer<(typeof TableColumnFilter)[TableColumnType.DATE]> = {} as SzDate;
const _e: z.infer<(typeof TableColumnFilter)[TableColumnType.ENUM]> = {} as SzEnum<any>;
const _b: SzPrimitive = {} as unknown as z.infer<
  (typeof TableColumnFilter)[TableColumnType.BOOLEAN]
>;

export type TableColumnFilter = {
  [p in TableColumnType]: z.infer<(typeof TableColumnFilter)[p]>;
};

export const TableColumnOptions = z
  .union(
    listify(TableColumnFilter, (k, v) => v) as UnionToTuple<
      (typeof TableColumnFilter)[TableColumnType]
    >,
  )
  .and(
    z.object({
      title: z.string().optional(),
      filterable: z.boolean().optional(),
      sortable: z.boolean().optional(),
      mono: z.boolean().optional(),
      password: z.boolean().optional(),
    }),
  );
export type TableColumnOptions = z.infer<typeof TableColumnOptions>;
