import { z } from "zod";

export const UserModel = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type UserModelType = z.infer<typeof UserModel>;
