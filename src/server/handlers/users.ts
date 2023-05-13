import UsersRouteSchemas from "@/data/schemas/routes/users";
import { prisma } from "@/server/lib/prisma";
import { makeEndpoint, paginate } from "@/server/utils/handler";
import { authenticationMiddleware } from "@/server/utils/middlewares";
import { RouteHandlersGeneralType } from "@/server/utils/types";

const usersRouteHandlers = {
  middlewares: [authenticationMiddleware()],
  routes: {
    "/": {
      get: makeEndpoint(UsersRouteSchemas["/"].get, async (req, res) => {
        const users = await prisma.user.findMany({
          where: {
            deletedAt: null,
          },
          ...paginate(req.query),
        });
        res.ack(users);
      }),
      post: makeEndpoint(UsersRouteSchemas["/"].post, async (req, res) => {
        const user = await prisma.user.create({
          data: req.body,
        });

        res.status(201);
        return res.ack(user);
      }),
    },
    "/:id": {
      get: makeEndpoint(UsersRouteSchemas["/:id"].get, async (req, res) => {
        const user = await prisma.user.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!user) return res.notFound();

        return res.ack(user);
      }),
      patch: makeEndpoint(UsersRouteSchemas["/:id"].patch, async (req, res) => {
        const user = await prisma.user.findFirst({
          where: { id: req.params.id, deletedAt: null },
        });

        if (!user) return res.notFound();

        const updatedUser = await prisma.user.update({
          where: { id: req.params.id },
          data: { ...req.body, updatedAt: new Date() },
        });

        return res.ack(updatedUser);
      }),
      delete: makeEndpoint(
        UsersRouteSchemas["/:id"].delete,
        async (req, res) => {
          const user = await prisma.user.updateMany({
            where: { id: req.params.id, deletedAt: null },
            data: { deletedAt: new Date() },
          });

          if (!user.count) return res.notFound();

          return res.end();
        }
      ),
    },
  },
} satisfies RouteHandlersGeneralType;

export default usersRouteHandlers;
export type UsersRouteHandlersType = typeof usersRouteHandlers;
