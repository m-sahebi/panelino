import { z } from "zod";
import { PAGE_SIZE } from "@/data/configs";

export const ZPaginated = z.object({
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).default(PAGE_SIZE),
  page: z.coerce.number().min(0).optional(),
  page_size: z.coerce.number().min(1).optional(),
});
