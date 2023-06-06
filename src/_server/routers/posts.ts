import { PostStatus, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { listify } from "radash";
import { z } from "zod";
import { AccessLevel, Permission } from "~/_server/data/roles";
import { protectedProcedure } from "~/_server/procedures/protected";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { makeResMeta, makeResSchema, parseFilter } from "~/_server/utils/helpers";
import { PostModel } from "~/data/models/post";
import { Id } from "~/data/schemas/id";
import { PaginatedReq } from "~/data/schemas/paginated-req";
import { PaginatedRes } from "~/data/schemas/paginated-res";
import { TableColumnType } from "~/data/schemas/table";
import { paginate } from "~/utils/helpers";
import { jsonParse } from "~/utils/primitive";
import { type UnionToTuple } from "~/utils/type";
import { zodCreateUnionSchema, zodParseDef } from "~/utils/zod";

const PostModelNoDeletedAt = PostModel.omit({ deletedAt: true });
const PostModelNoMeta = PostModelNoDeletedAt.omit({
  createdAt: true,
  updatedAt: true,
});
const PostModelNoMetaAndId = PostModelNoMeta.omit({ id: true });

const GetManyOutput = makeResSchema(z.array(PostModelNoDeletedAt)).merge(PaginatedRes);
const GetManyOutputItemsParsedDef = zodParseDef<z.ZodTypeDef>(GetManyOutput.shape.items.element);

export const postsRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(
      PaginatedReq.extend({
        sort: zodCreateUnionSchema(
          Object.keys(PostModelNoDeletedAt.shape) as UnionToTuple<
            keyof typeof PostModelNoDeletedAt["shape"]
          >,
        ).optional(),
        order: zodCreateUnionSchema(["asc", "desc"] as const).optional(),
        filter: z.string().optional(),
        userId: z.string().optional(),
        groupId: z.string().optional(),
        meta: z.boolean().optional(),
      }),
    )
    .output(GetManyOutput.merge(makeResMeta(PostModelNoDeletedAt.keyof())))
    .query(
      async ({
        input: { sort, order, filter, userId, groupId, meta, ...p },
        ctx: { prisma, session, permissions },
      }) => {
        const uid = session?.user.id;
        const gid = session?.user.groupId ?? undefined;
        const readPerm = permissions[Permission.POST_READ] ?? AccessLevel.NONE;
        let whereQuery: Prisma.PostWhereInput = { deletedAt: null };

        switch (readPerm) {
          case AccessLevel.NONE:
            whereQuery = {
              ...whereQuery,
              authorId: userId,
              author: { groupId: userId ? undefined : groupId },
              status: PostStatus.PUBLISHED,
            };
            break;
          case AccessLevel.SELF:
            whereQuery = userId
              ? {
                  ...whereQuery,
                  authorId: userId,
                  status: uid === userId ? undefined : PostStatus.PUBLISHED,
                }
              : {
                  ...whereQuery,
                  author: { groupId: groupId },
                  status: PostStatus.PUBLISHED,
                };
            break;
          case AccessLevel.GROUP:
            const userInGroup =
              userId === uid ||
              !!(
                userId &&
                (
                  await prisma.group
                    .findUnique({ where: { id: gid } })
                    .users({ where: { id: userId }, select: { id: true } })
                )?.length
              );

            whereQuery = userId
              ? {
                  ...whereQuery,
                  authorId: userId,
                  status: userInGroup ? undefined : PostStatus.PUBLISHED,
                }
              : {
                  ...whereQuery,
                  author: { groupId: groupId },
                  status: gid === groupId ? undefined : PostStatus.PUBLISHED,
                };
            break;
          case AccessLevel.ALL:
            whereQuery = {
              ...whereQuery,
              authorId: userId,
              author: { groupId: userId ? undefined : groupId },
            };
            break;
          default:
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        const f = parseFilter(
          jsonParse(decodeURIComponent(filter ?? "")),
          GetManyOutputItemsParsedDef,
        );
        const where = { ...whereQuery, ...f };
        const total = await prisma.post.count({ where });
        const [prismaPage, page] = paginate(p, total);
        const posts = await prisma.post.findMany({
          where,
          orderBy: sort && { [sort]: order },
          ...prismaPage,
        });

        return {
          total,
          ...page,
          items: posts,
          ...(meta
            ? {
                meta: {
                  columns: {
                    // ...mapValues(PostModelNoDeletedAt.shape, () => null),
                    id: {
                      type: { typeName: TableColumnType.STRING },
                      title: "id",
                      filterable: true,
                      sortable: true,
                      mono: true,
                    },
                    title: {
                      type: { typeName: TableColumnType.STRING },
                      filterable: true,
                      sortable: true,
                    },
                    content: {
                      type: { typeName: TableColumnType.STRING },
                      filterable: true,
                      sortable: true,
                    },
                    status: {
                      type: {
                        typeName: TableColumnType.ENUM,
                        values: listify(PostStatus, (key, val) => val),
                      },
                      filterable: true,
                      sortable: true,
                    },
                    createdAt: {
                      type: { typeName: TableColumnType.DATE },
                      filterable: true,
                      sortable: true,
                    },
                  },
                },
              }
            : {}),
        };
      },
    ),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .output(makeResSchema(PostModelNoDeletedAt))
    .query(async ({ input: { id }, ctx: { prisma, session, permissions } }) => {
      const uid = session?.user.id;
      const gid = session?.user.groupId ?? undefined;
      const readPerm = permissions[Permission.POST_READ] ?? AccessLevel.NONE;

      const post = await prisma.post.findFirst({
        where: { id, deletedAt: null },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      if (post.status === PostStatus.PUBLISHED) return { items: post };

      switch (readPerm) {
        case AccessLevel.NONE:
          throw new TRPCError({ code: "NOT_FOUND" });
        case AccessLevel.SELF:
          if (post.authorId !== uid) throw new TRPCError({ code: "NOT_FOUND" });
          break;
        case AccessLevel.GROUP:
          if (uid !== post.authorId) {
            const authorInGroup = (
              await prisma.group
                .findUnique({ where: { id: gid } })
                .users({ where: { id: uid }, select: { id: true } })
            )?.length;
            if (!authorInGroup) throw new TRPCError({ code: "NOT_FOUND" });
          }
          break;
        case AccessLevel.ALL:
          // Nothing!
          break;
        default:
          throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        items: post,
      };
    }),

  create: protectedProcedure
    .meta({ minPermissions: { [Permission.POST_CREATE]: AccessLevel.SELF } })
    .input(PostModelNoMetaAndId.partial({ authorId: true }))
    .output(makeResSchema(PostModelNoDeletedAt))
    .mutation(
      async ({ input: { authorId, ...newPost }, ctx: { prisma, session, permissions } }) => {
        const uid = session?.user.id;
        const gid = session?.user.groupId ?? undefined;
        const createPerm = permissions[Permission.POST_CREATE];

        switch (createPerm) {
          case AccessLevel.SELF:
            if (authorId && authorId !== uid) throw new TRPCError({ code: "FORBIDDEN" });
            break;
          case AccessLevel.GROUP:
            if (authorId && uid !== authorId) {
              const authorInGroup = (
                await prisma.group
                  .findUnique({ where: { id: gid } })
                  .users({ where: { id: uid }, select: { id: true } })
              )?.length;
              if (!authorInGroup) throw new TRPCError({ code: "FORBIDDEN" });
            }
            break;
          case AccessLevel.ALL:
            // Nothing!
            break;
          default:
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        const post = await prisma.post.create({
          data: { ...newPost, authorId: authorId || uid },
        });

        return { items: post };
      },
    ),

  update: protectedProcedure
    .meta({ minPermissions: { [Permission.POST_UPDATE]: AccessLevel.SELF } })
    .input(PostModelNoMeta.partial().required({ id: true }))
    .output(makeResSchema(PostModelNoDeletedAt))
    .mutation(async ({ input: { ...updatedPost }, ctx: { prisma, session, permissions } }) => {
      const uid = session?.user.id;
      const gid = session?.user.groupId ?? undefined;
      const updatePerm = permissions[Permission.POST_UPDATE];

      const post = await prisma.post.findFirst({
        where: { id: updatedPost.id, deletedAt: null },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      switch (updatePerm) {
        case AccessLevel.SELF:
          if (post.authorId !== uid) throw new TRPCError({ code: "NOT_FOUND" });
          break;
        case AccessLevel.GROUP:
          if (uid !== post.authorId) {
            const authorInGroup = (
              await prisma.group
                .findUnique({ where: { id: gid } })
                .users({ where: { id: uid }, select: { id: true } })
            )?.length;
            if (!authorInGroup) throw new TRPCError({ code: "NOT_FOUND" });
          }
          break;
        case AccessLevel.ALL:
          // Nothing!
          break;
        default:
          throw new TRPCError({ code: "FORBIDDEN" });
      }

      return {
        items: await prisma.post.update({
          where: { id: updatedPost.id },
          data: { ...updatedPost, updatedAt: new Date() },
        }),
      };
    }),

  delete: protectedProcedure
    .meta({ minPermissions: { [Permission.POST_DELETE]: AccessLevel.SELF } })
    .input(Id)
    .output(makeResSchema(PostModelNoDeletedAt))
    .mutation(async ({ input: { id }, ctx: { prisma, session, permissions } }) => {
      const uid = session?.user.id;
      const gid = session?.user.groupId ?? undefined;
      const deletePerm = permissions[Permission.POST_DELETE];

      const post = await prisma.post.findFirst({
        where: { id, deletedAt: null },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      switch (deletePerm) {
        case AccessLevel.SELF:
          if (post.authorId !== uid) throw new TRPCError({ code: "NOT_FOUND" });
          break;
        case AccessLevel.GROUP:
          if (uid !== post.authorId) {
            const authorInGroup = (
              await prisma.group
                .findUnique({ where: { id: gid } })
                .users({ where: { id: uid }, select: { id: true } })
            )?.length;
            if (!authorInGroup) throw new TRPCError({ code: "NOT_FOUND" });
          }
          break;
        case AccessLevel.ALL:
          // Nothing!
          break;
        default:
          throw new TRPCError({ code: "FORBIDDEN" });
      }

      await prisma.post.updateMany({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
      });

      return { items: post };
    }),
});
