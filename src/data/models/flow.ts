import { z } from "zod";
import { zGetSchemaKeysListAndMeta } from "@/utils/zod";

export const FlowModel = z.object({
  id: z.number().int(),
  content: z.string().nullish(),
  ownerId: z.number().describe("relation.user").int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type FlowModelType = z.infer<typeof FlowModel>;

const keysAndInfo = zGetSchemaKeysListAndMeta(FlowModel);
export const FlowModelKeysList = keysAndInfo[0];
export const FlowModelKeysMeta = keysAndInfo[1];
