import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/_server/procedures/protected";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { paginate } from "~/_server/utils/paginate";
import { UserModel } from "~/data/models/user";
import { ZId } from "~/data/schemas/z-id";
import { ZPaginatedReq } from "~/data/schemas/z-paginated-req";
import { ZPaginatedRes } from "~/data/schemas/z-paginated-res";
import { jsonParse } from "~/utils/json-parse";
import { parseFilter } from "~/utils/query-filter";
import { type UnionToTuple } from "~/utils/type";
import { zCreateUnionSchema, zMakeRes, zParseDef } from "~/utils/zod";

const UserModelNoDeletedAt = UserModel.omit({ deletedAt: true });
const UserModelNoMeta = UserModelNoDeletedAt.omit({
  createdAt: true,
  updatedAt: true,
});
const UserModelNoMetaAndId = UserModelNoMeta.omit({ id: true });

const getManyOutputSchema = zMakeRes(z.array(UserModelNoMeta)).merge(ZPaginatedRes);
const getManyOutputItemsParsedDef = zParseDef<z.ZodTypeDef>(
  getManyOutputSchema.shape.items.element._def,
);

export const usersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(ZId)
    .output(
      zMakeRes(UserModel.omit({ createdAt: true, updatedAt: true, deletedAt: true })),
    )
    .query(async ({ input: { id }, ctx: { prisma, session } }) => {
      const user = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: user };
    }),
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .output(
      zMakeRes(UserModel.omit({ createdAt: true, updatedAt: true, deletedAt: true })),
    )
    .query(async ({ input: { email }, ctx: { prisma, session } }) => {
      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: user };
    }),
  getMany: publicProcedure
    .input(
      ZPaginatedReq.merge(
        z
          .object({
            sort: zCreateUnionSchema(
              Object.keys(UserModelNoMeta.shape) as UnionToTuple<
                keyof (typeof UserModelNoMeta)["shape"]
              >,
            ),
            order: zCreateUnionSchema(["asc", "desc"] as const),
            filter: z.string(),
          })
          .partial(),
      ),
    )
    .output(getManyOutputSchema)
    .query(async ({ input: { sort, order, filter, ...p }, ctx: { prisma, session } }) => {
      const total = await prisma.user.count({ where: { deletedAt: null } });
      const [prismaPage, page] = paginate(p, total);
      const f = parseFilter(
        jsonParse(decodeURIComponent(filter ?? "")),
        getManyOutputItemsParsedDef,
      );

      const users = await prisma.user.findMany({
        where: {
          deletedAt: null,
          ...f,
        },
        orderBy: sort && { [sort]: order },
        ...prismaPage,
      });

      return { total, ...page, items: users };
    }),
  create: protectedProcedure
    .input(UserModelNoMetaAndId)
    .output(zMakeRes(UserModelNoMeta))
    .mutation(async ({ input: { ...newUser }, ctx: { prisma, session } }) => {
      const user = await prisma.user.create({
        data: newUser,
      });

      return { items: user };
    }),
  update: protectedProcedure
    .input(UserModelNoMeta.partial().required({ id: true }))
    .output(zMakeRes(UserModelNoMeta))
    .mutation(async ({ input: { ...updatedUser }, ctx: { prisma, session } }) => {
      const user = await prisma.user.findFirst({
        where: { id: updatedUser.id, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        items: await prisma.user.update({
          where: { id: updatedUser.id },
          data: { ...updatedUser, updatedAt: new Date() },
        }),
      };
    }),
  delete: protectedProcedure
    .input(ZId)
    .output(zMakeRes(UserModelNoMeta))
    .mutation(async ({ input: { id }, ctx: { prisma, session } }) => {
      const user = await prisma.user.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      if (!user.count) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: (await prisma.user.findUnique({ where: { id } }))! };
    }),
});
