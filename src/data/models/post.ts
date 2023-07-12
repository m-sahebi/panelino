import { PostStatus } from "@prisma/client";
import { z } from "zod";
import { enumToArray } from "~/utils/primitive";

export const PostModel = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string().nullish(),
  featuredImageId: z.string().describe("file=image").nullish(),
  status: z.enum(enumToArray(PostStatus)),
  authorId: z.string().describe("relation=user"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type PostModel = z.infer<typeof PostModel>;
