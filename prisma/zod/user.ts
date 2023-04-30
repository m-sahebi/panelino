import * as z from 'zod';

export const UserSchema = z.object({
  id: z.number().int(),
  password: z.string().nullish(),
  email: z.string(),
  name: z.string().nullish(),
  githubId: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});
