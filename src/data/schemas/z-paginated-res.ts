import { z } from "zod";
import { ZRes } from "~/data/schemas/z-res";

export const ZPaginatedRes = z
  .object({
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
  })
  .extend(ZRes.shape);
