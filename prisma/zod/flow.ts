import * as z from "zod"
import * as imports from "../null"

export const FlowSchema = z.object({
  id: z.number().int(),
  content: z.string().nullish(),
  ownerId: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
})
