import { z } from "zod";
import { zGetSchemaKeysListAndMeta } from "@/utils/zod";

export const UserModel = z.object({
  id: z.number().int(),
  email: z.string().email(),
  name: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type UserModelType = z.infer<typeof UserModel>;

const keysAndInfo = zGetSchemaKeysListAndMeta(UserModel);
export const UserModelKeysList = keysAndInfo[0];
export const UserModelKeysMeta = keysAndInfo[1];
