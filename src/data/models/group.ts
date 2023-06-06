import * as z from "zod";

export const GroupModel = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type GroupModel = z.infer<typeof GroupModel>;
