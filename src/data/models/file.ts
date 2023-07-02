import { z } from "zod";

export const FileModel = z.object({
  id: z.string(),
  key: z.string(),
  name: z.string(),
  mimeType: z.string().nullish(),
  createdById: z.string().describe("relation=user"),
});

export type FileModel = z.infer<typeof FileModel>;
