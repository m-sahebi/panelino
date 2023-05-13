import { PostStatus } from "@prisma/client";
import { z } from "zod";
import { zGetSchemaKeysListAndMeta } from "@/utils/zod";

export const PostModel = z.object({
  id: z.number().int(),
  title: z.string(),
  content: z.string().nullish(),
  status: z.nativeEnum(PostStatus),
  authorId: z.number().describe("relation.user").int(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type PostModelType = z.infer<typeof PostModel>;

const keysAndInfo = zGetSchemaKeysListAndMeta(PostModel);
export const PostModelKeysList = keysAndInfo[0];
export const PostModelKeysMeta = keysAndInfo[1];
