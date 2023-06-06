import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/_server/procedures/protected";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { makeResSchema, parseFilter } from "~/_server/utils/helpers";
import { UserModel } from "~/data/models/user";
import { Id } from "~/data/schemas/id";
import { PaginatedReq } from "~/data/schemas/paginated-req";
import { PaginatedRes } from "~/data/schemas/paginated-res";
import { paginate } from "~/utils/helpers";
import { jsonParse } from "~/utils/primitive";
import { type UnionToTuple } from "~/utils/type";
import { zodCreateUnionSchema, zodParseDef } from "~/utils/zod";

const UserModelNoDeletedAt = UserModel.omit({ deletedAt: true });
const UserModelNoMeta = UserModelNoDeletedAt.omit({
  createdAt: true,
  updatedAt: true,
});
const UserModelNoMetaAndId = UserModelNoMeta.omit({ id: true });

const getManyOutputSchema = makeResSchema(z.array(UserModelNoMeta)).merge(PaginatedRes);
const getManyOutputItemsParsedDef = zodParseDef<z.ZodTypeDef>(
  getManyOutputSchema.shape.items.element._def,
);

export const usersRouter = createTRPCRouter({
  getById: publicProcedure
    .input(Id)
    .output(makeResSchema(UserModel.omit({ createdAt: true, updatedAt: true, deletedAt: true })))
    .query(async ({ input: { id }, ctx: { prisma, session } }) => {
      const user = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: user };
    }),
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .output(makeResSchema(UserModel.omit({ createdAt: true, updatedAt: true, deletedAt: true })))
    .query(async ({ input: { email }, ctx: { prisma, session } }) => {
      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: user };
    }),
  getMany: publicProcedure
    .input(
      PaginatedReq.merge(
        z
          .object({
            sort: zodCreateUnionSchema(
              Object.keys(UserModelNoMeta.shape) as UnionToTuple<
                keyof typeof UserModelNoMeta["shape"]
              >,
            ),
            order: zodCreateUnionSchema(["asc", "desc"] as const),
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
    .output(makeResSchema(UserModelNoMeta))
    .mutation(async ({ input: { ...newUser }, ctx: { prisma, session } }) => {
      const user = await prisma.user.create({
        data: newUser,
      });

      return { items: user };
    }),
  update: protectedProcedure
    .input(UserModelNoMeta.partial().required({ id: true }))
    .output(makeResSchema(UserModelNoMeta))
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
    .input(Id)
    .output(makeResSchema(UserModelNoMeta))
    .mutation(async ({ input: { id }, ctx: { prisma, session } }) => {
      const user = await prisma.user.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      if (!user.count) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: (await prisma.user.findUnique({ where: { id } }))! };
    }),
});
