import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "~/_server/procedures/protected";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { paginate } from "~/_server/utils/paginate";
import { PostModel } from "~/data/models/post";
import { ZId } from "~/data/schemas/z-id";
import { ZPaginatedReq } from "~/data/schemas/z-paginated-req";
import { ZPaginatedRes } from "~/data/schemas/z-paginated-res";
import { jsonParse } from "~/utils/json-parse";
import { parseFilter } from "~/utils/query-filter";
import { type UnionToTuple } from "~/utils/type";
import { zCreateUnionSchema, zMakeRes, zParseDef } from "~/utils/zod";

const PostModelNoDeletedAt = PostModel.omit({ deletedAt: true });
const PostModelNoMeta = PostModelNoDeletedAt.omit({
  createdAt: true,
  updatedAt: true,
});
const PostModelNoMetaAndId = PostModelNoMeta.omit({ id: true });

const getManyOutputSchema = zMakeRes(z.array(PostModelNoDeletedAt)).merge(ZPaginatedRes);
const getManyOutputItemsParsedDef = zParseDef<z.ZodTypeDef>(
  getManyOutputSchema.shape.items.element._def,
);

export const postsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(zMakeRes(PostModelNoDeletedAt))
    .query(async ({ input: { id }, ctx: { prisma, session } }) => {
      const post = await prisma.post.findFirst({
        where: { id, deletedAt: null },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: post };
    }),
  getMany: publicProcedure
    .input(
      ZPaginatedReq.merge(
        z
          .object({
            sort: zCreateUnionSchema(
              Object.keys(PostModelNoDeletedAt.shape) as UnionToTuple<
                keyof (typeof PostModelNoDeletedAt)["shape"]
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
      const total = await prisma.post.count({ where: { deletedAt: null } });
      const [prismaPage, page] = paginate(p, total);
      const f = parseFilter(
        jsonParse(decodeURIComponent(filter ?? "")),
        getManyOutputItemsParsedDef,
      );

      const posts = await prisma.post.findMany({
        where: {
          deletedAt: null,
          ...f,
        },
        orderBy: sort && { [sort]: order },
        ...prismaPage,
      });

      return { total, ...page, items: posts };
    }),
  create: protectedProcedure
    .input(PostModelNoMetaAndId)
    .output(zMakeRes(PostModelNoDeletedAt))
    .mutation(async ({ input: { ...newPost }, ctx: { prisma, session } }) => {
      const post = await prisma.post.create({
        data: newPost,
      });

      return { items: post };
    }),
  update: protectedProcedure
    .input(PostModelNoMeta.partial().required({ id: true }))
    .output(zMakeRes(PostModelNoDeletedAt))
    .mutation(async ({ input: { ...updatedPost }, ctx: { prisma, session } }) => {
      const post = await prisma.post.findFirst({
        where: { id: updatedPost.id, deletedAt: null },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      return {
        items: await prisma.post.update({
          where: { id: updatedPost.id },
          data: { ...updatedPost, updatedAt: new Date() },
        }),
      };
    }),
  delete: protectedProcedure
    .input(ZId)
    .output(zMakeRes(PostModelNoDeletedAt))
    .mutation(async ({ input: { id }, ctx: { prisma, session } }) => {
      const post = await prisma.post.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      if (!post.count) throw new TRPCError({ code: "NOT_FOUND" });

      return { items: (await prisma.post.findUnique({ where: { id } }))! };
    }),
});
