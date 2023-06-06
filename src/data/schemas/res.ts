import { z } from "zod";

export const Res = z.object({
  message: z.string().optional(),
});
