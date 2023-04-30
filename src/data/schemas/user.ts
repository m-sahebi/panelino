import { z } from 'zod';

export const UserSchema = z.object({
  id: z.number().int(),
  email: z.string().email(),
  name: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});
