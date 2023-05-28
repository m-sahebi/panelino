import { PostStatus } from "@prisma/client";
import { z } from "zod";

export const PostModel = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().nullish(),
  status: z.nativeEnum(PostStatus),
  authorId: z.string().describe("relation.user"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type PostModelType = z.infer<typeof PostModel>;
