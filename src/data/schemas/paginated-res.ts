import { z } from "zod";
import { Res } from "~/data/schemas/res";

export const PaginatedRes = z
  .object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .extend(Res.shape);
