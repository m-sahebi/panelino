import { z } from "zod";

export const FlowModel = z.object({
  id: z.string(),
  content: z.string().nullish(),
  ownerId: z.string().describe("relation=user"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type FlowModel = z.infer<typeof FlowModel>;
