import { z } from "zod";
import { DATE_TIME_FORMAT } from "~/data/configs";
import { dayjs } from "~/lib/dayjs";
import { type ZodParsedDef } from "~/utils/zod";

export function parseFilter(
  rawFilter: {
    [p: string]: unknown;
  },
  parsedOutputDef: ZodParsedDef<z.ZodTypeDef & { typeName?: z.ZodFirstPartyTypeKind }>,
): Record<string, any> {
  const where: Record<string, any> = {};
  const obj = parsedOutputDef.obj;
  if (obj == null) return where;
  parsedOutputDef.keys!.forEach((k) => {
    const val = rawFilter[k];
    if (obj[k].typeName === z.ZodFirstPartyTypeKind.ZodString && typeof val === "string")
      where[k] = { contains: val, mode: "insensitive" };
    else if (
      obj[k].typeName === z.ZodFirstPartyTypeKind.ZodNumber &&
      typeof val === "number"
    )
      where[k] = { equals: val };
    else if (
      obj[k].typeName === z.ZodFirstPartyTypeKind.ZodNativeEnum &&
      typeof val === "string"
    )
      where[k] = { equals: val, mode: "insensitive" };
    else if (
      obj[k].typeName === z.ZodFirstPartyTypeKind.ZodDate &&
      typeof val === "string"
    ) {
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
