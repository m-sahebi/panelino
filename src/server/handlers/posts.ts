import PostsRouteSchemas from "@/data/schemas/routes/posts";
import { prisma } from "@/server/lib/prisma";
import { makeEndpoint, paginate } from "@/server/utils/handler";
import { authenticationMiddleware } from "@/server/utils/middlewares";
import { RouteHandlersGeneralType } from "@/server/utils/types";

const postsRouteHandlers = {
  middlewares: [authenticationMiddleware()],
  routes: {
    "/": {
      get: makeEndpoint(PostsRouteSchemas["/"].get, async (req, res) => {
        const posts = await prisma.post.findMany({
          where: {
            deletedAt: null,
          },
          ...paginate(req.query),
        });
        res.ack(posts);
      }),
      post: makeEndpoint(PostsRouteSchemas["/"].post, async (req, res) => {
        const post = await prisma.post.create({
          data: req.body,
        });

        res.status(201);
        return res.ack(post);
      }),
    },
    "/:id": {
      get: makeEndpoint(PostsRouteSchemas["/:id"].get, async (req, res) => {
        const post = await prisma.post.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!post) return res.notFound();

        return res.ack(post);
      }),
      patch: makeEndpoint(PostsRouteSchemas["/:id"].patch, async (req, res) => {
        const post = await prisma.post.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!post) return res.notFound();

        const updatedPost = await prisma.post.update({
          where: { id: req.params.id },
          data: { ...req.body, updatedAt: new Date() },
        });

        return res.ack(updatedPost);
      }),
      delete: makeEndpoint(
        PostsRouteSchemas["/:id"].delete,
        async (req, res) => {
          const post = await prisma.post.updateMany({
            where: { id: req.params.id, deletedAt: null },
            data: { deletedAt: new Date() },
          });

          if (!post.count) return res.notFound();

          return res.end();
        }
      ),
    },
  },
} satisfies RouteHandlersGeneralType;

export default postsRouteHandlers;
export type PostsRouteHandlersType = typeof postsRouteHandlers;
