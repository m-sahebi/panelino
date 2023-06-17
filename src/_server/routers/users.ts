import { UserRole, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { listify, mapValues, objectify, pick } from "radash";
import { z } from "zod";
import { protectedProcedure } from "~/_server/procedures/protected";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { getOptionsForMethodGetMany, makeResSchema, parseFilter } from "~/_server/utils/helpers";
import { UserModel } from "~/data/models/user";
import { Id } from "~/data/schemas/id";
import { PaginatedReq } from "~/data/schemas/paginated-req";
import { TableColumnType } from "~/data/schemas/table";
import { paginate } from "~/utils/helpers";
import { getNonNullable, jsonParse } from "~/utils/primitive";

const UserModelNoDeletedAt = UserModel.omit({ deletedAt: true });
const UserModelNoMeta = UserModelNoDeletedAt.omit({
  createdAt: true,
  updatedAt: true,
});
const UserModelNoMetaAndId = UserModelNoMeta.omit({ id: true });

const opt = getOptionsForMethodGetMany(UserModelNoMeta, ["id", "name", "email"], {
  ...mapValues(UserModelNoMeta.shape, () => null),
  id: {
    ...{ type: `${TableColumnType.STRING}` },
    title: "id",
    filterable: true,
    sortable: true,
    mono: true,
  },
  name: {
    ...{ type: TableColumnType.STRING },
    filterable: true,
    sortable: true,
  },
  email: {
    ...{ type: TableColumnType.STRING },
    filterable: true,
    sortable: true,
  },
  role: {
    ...{
      type: TableColumnType.ENUM,
      values: listify(UserRole, (key, val) => val),
    },
    filterable: true,
    sortable: true,
  },
});

export const usersRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(
      PaginatedReq.extend({
        sort: UserModelNoMeta.keyof().optional(),
        order: z.enum(["asc", "desc"] as const).optional(),
        filter: z.string().optional(),
        search: z.string().optional(),
      }),
    )
    .output(opt.outputSchema)
    .query(async ({ input: { sort, order, filter, search, ...p }, ctx: { prisma } }) => {
      const total = await prisma.user.count({ where: { deletedAt: null } });
      const [prismaPage, page] = paginate(p, total);
      let whereQuery: Prisma.UserWhereInput = { deletedAt: null };

      const s = decodeURIComponent(search ?? "");
      whereQuery = {
        ...(filter
          ? parseFilter(
              pick(jsonParse(decodeURIComponent(filter ?? "")), opt.filterableColumns),
              opt.outputItemsSchemaParsed,
            )
          : {}),
        OR: s
          ? listify(
              parseFilter(
                objectify(
                  opt.generallySearchableColumns,
                  (c) => c,
                  () => s,
                ),
                opt.outputItemsSchemaParsed,
              ),
              (k, v) => ({ [k]: v }),
            )
          : undefined,
        ...whereQuery,
      };

      const users = await prisma.user.findMany({
        where: {
          ...whereQuery,
        },
        orderBy: (sort && opt.sortableColumns.includes(sort) && { [sort]: order }) || undefined,
        ...prismaPage,
      });

      return { total, ...page, items: users };
    }),
  getById: publicProcedure
    .input(Id)
    .output(makeResSchema(UserModel.omit({ createdAt: true, updatedAt: true, deletedAt: true })))
    .query(async ({ input: { id }, ctx: { prisma } }) => {
      const user = await prisma.user.findFirst({
        where: { id, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: user };
    }),
  getByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .output(makeResSchema(UserModel.omit({ createdAt: true, updatedAt: true, deletedAt: true })))
    .query(async ({ input: { email }, ctx: { prisma } }) => {
      const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
      });

      if (!user) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: user };
    }),
  create: protectedProcedure
    .input(UserModelNoMetaAndId)
    .output(makeResSchema(UserModelNoMeta))
    .mutation(async ({ input: { ...newUser }, ctx: { prisma } }) => {
      const user = await prisma.user.create({
        data: newUser,
      });

      return { items: user };
    }),
  update: protectedProcedure
    .input(UserModelNoMeta.partial().required({ id: true }))
    .output(makeResSchema(UserModelNoMeta))
    .mutation(async ({ input: { ...updatedUser }, ctx: { prisma } }) => {
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
    .mutation(async ({ input: { id }, ctx: { prisma } }) => {
      const user = await prisma.user.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      if (!user.count) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: getNonNullable(await prisma.user.findUnique({ where: { id } })) };
    }),
});
