import { makeEndpoint, ncc } from '@/server/lib/nc';
import { z } from 'zod';
import { UserSchema } from '@/data/schemas/user';
import { prisma } from '@/server/lib/prisma';
import { zNoIdAndMeta, zNoMeta, ZPaginated } from '@/utils/zod';
import { authenticateMiddleware } from '@/server/utils/auth';

const userRoute = ncc()
  .use(authenticateMiddleware())
  .get(
    '/',
    makeEndpoint(
      { response: z.array(zNoMeta(UserSchema)), query: ZPaginated },
      async (req, res) => {
        const users = await prisma.user.findMany({
          where: {
            deletedAt: null,
          },
          take: req.query.limit,
          skip: req.query.offset,
        });
        res.ack(users);
      }
    )
  )
  .get(
    '/:id',
    makeEndpoint(
      {
        response: zNoMeta(UserSchema),
        params: z.object({ id: z.coerce.number() }),
      },
      async (req, res) => {
        const user = await prisma.user.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!user) return res.notFound();

        return res.ack(user);
      }
    )
  )
  .post(
    '/',
    makeEndpoint(
      {
        response: zNoMeta(UserSchema),
        body: zNoIdAndMeta(UserSchema),
      },
      async (req, res) => {
        const user = await prisma.user.create({
          data: req.body,
        });

        res.status(201);
        return res.ack(user);
      }
    )
  )
  .patch(
    '/:id',
    makeEndpoint(
      {
        response: zNoMeta(UserSchema),
        params: z.object({ id: z.coerce.number() }),
        body: zNoIdAndMeta(UserSchema).partial(),
      },
      async (req, res) => {
        const user = await prisma.user.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!user) return res.notFound();

        const updatedUser = await prisma.user.update({
          where: { id: req.params.id },
          data: { ...req.body, updatedAt: new Date() },
        });

        return res.ack(updatedUser);
      }
    )
  )
  .delete(
    '/:id',
    makeEndpoint(
      {
        params: z.object({ id: z.coerce.number() }),
        response: zNoMeta(UserSchema),
      },
      async (req, res) => {
        const user = await prisma.user.updateMany({
          where: { id: req.params.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        if (!user.count) return res.notFound();

        return res.end();
      }
    )
  );

export default userRoute;
