import { UserRole, UserStatus } from "@prisma/client";
import { z } from "zod";

export const UserModel = z.object({
  id: z.string(),
  password: z.string().nullish(),
  email: z.string().email(),
  name: z.string().nullish(),
  githubId: z.string().nullish(),
  role: z.nativeEnum(UserRole),
  status: z.nativeEnum(UserStatus),
  groupId: z.string().describe("relation=group").nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type UserModel = z.infer<typeof UserModel>;
