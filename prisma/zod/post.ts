import * as z from "zod"
import * as imports from "../null"

export const PostSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  content: z.string().nullish(),
  published: z.boolean(),
  authorId: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
})
