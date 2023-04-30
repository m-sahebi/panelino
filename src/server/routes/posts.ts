import { makeEndpoint, ncc } from '@/server/lib/nc';
import { z } from 'zod';
import { PostSchema } from '@/data/schemas/post';
import { prisma } from '@/server/lib/prisma';
import { zNoIdAndMeta, zNoMeta, ZPaginated } from '@/utils/zod';
import { authenticateMiddleware } from '@/server/utils/auth';

const postRoute = ncc()
  .use(authenticateMiddleware())
  .get(
    '/',
    makeEndpoint(
      { response: z.array(zNoMeta(PostSchema)), query: ZPaginated },
      async (req, res) => {
        const posts = await prisma.post.findMany({
          where: {
            deletedAt: null,
          },
          take: req.query.limit,
          skip: req.query.offset,
        });
        res.ack(posts);
      }
    )
  )
  .get(
    '/:id',
    makeEndpoint(
      {
        response: zNoMeta(PostSchema),
        params: z.object({ id: z.coerce.number() }),
      },
      async (req, res) => {
        const post = await prisma.post.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!post) return res.notFound();

        return res.ack(post);
      }
    )
  )
  .post(
    '/',
    makeEndpoint(
      {
        response: zNoMeta(PostSchema),
        body: zNoIdAndMeta(PostSchema),
      },
      async (req, res) => {
        const post = await prisma.post.create({
          data: req.body,
        });

        res.status(201);
        return res.ack(post);
      }
    )
  )
  .patch(
    '/:id',
    makeEndpoint(
      {
        response: zNoMeta(PostSchema),
        params: z.object({ id: z.coerce.number() }),
        body: zNoIdAndMeta(PostSchema).partial(),
      },
      async (req, res) => {
        const post = await prisma.post.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!post) return res.notFound();

        const updatedPost = await prisma.post.update({
          where: { id: req.params.id },
          data: { ...req.body, updatedAt: new Date() },
        });

        return res.ack(updatedPost);
      }
    )
  )
  .delete(
    '/:id',
    makeEndpoint(
      {
        params: z.object({ id: z.coerce.number() }),
        response: zNoMeta(PostSchema),
      },
      async (req, res) => {
        const post = await prisma.post.updateMany({
          where: { id: req.params.id, deletedAt: null },
          data: { deletedAt: new Date() },
        });

        if (!post.count) return res.notFound();

        return res.end();
      }
    )
  );

export default postRoute;
