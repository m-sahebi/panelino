import { z } from "zod";

export const ZPaginatedReq = z.object({
  offset: z.coerce.number().min(0).optional(),
  limit: z.coerce.number().min(1).optional(),
  page: z.coerce.number().min(0).optional(),
  pageSize: z.coerce.number().min(1).optional(),
});
