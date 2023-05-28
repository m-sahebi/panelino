import { z } from "zod";

export const ZRes = z.object({
  message: z.string().optional(),
});
