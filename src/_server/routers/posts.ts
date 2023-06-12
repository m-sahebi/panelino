import { PostStatus, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { listify, mapValues, objectify, pick } from "radash";
import { z } from "zod";
import { AccessLevel, Permission } from "~/_server/data/roles";
import { protectedProcedure } from "~/_server/procedures/protected";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { makeOptionsForMethodGetMany, makeResSchema, parseFilter } from "~/_server/utils/helpers";
import { PostModel } from "~/data/models/post";
import { Id } from "~/data/schemas/id";
import { PaginatedReq } from "~/data/schemas/paginated-req";
import { TableColumnType } from "~/data/schemas/table";
import { paginate } from "~/utils/helpers";
import { jsonParse } from "~/utils/primitive";

const PostModelNoDeletedAt = PostModel.omit({ deletedAt: true });
const PostModelNoMeta = PostModelNoDeletedAt.omit({
  createdAt: true,
  updatedAt: true,
});
const PostModelNoMetaAndId = PostModelNoMeta.omit({ id: true });

const opt = makeOptionsForMethodGetMany(PostModelNoDeletedAt, ["id", "title", "content"], {
  ...mapValues(PostModelNoDeletedAt.shape, () => null),
  id: {
    ...{ type: `${TableColumnType.STRING}` },
    title: "id",
    filterable: true,
    sortable: true,
    mono: true,
  },
  title: {
    ...{ type: TableColumnType.STRING },
    filterable: true,
    sortable: true,
  },
  content: {
    ...{ type: TableColumnType.STRING },
    filterable: true,
    sortable: true,
  },
  status: {
    ...{
      type: TableColumnType.ENUM,
      values: listify(PostStatus, (key, val) => val),
    },
    filterable: true,
    sortable: true,
  },
  createdAt: {
    ...{ type: TableColumnType.DATE },
    filterable: true,
    sortable: true,
  },
  updatedAt: {
    ...{ type: TableColumnType.DATE },
    filterable: true,
    sortable: true,
  },
});

export const postsRouter = createTRPCRouter({
  getMany: publicProcedure
    .input(
      PaginatedReq.extend({
        search: z.string().optional(),
        sort: PostModelNoDeletedAt.keyof().optional(),
        order: z.enum(["asc", "desc"] as const).optional(),
        filter: z.string().optional(),
        userId: z.string().optional(),
        groupId: z.string().optional(),
        meta: z.enum(["TRUE", "FALSE"]).optional(),
      }),
    )
    .output(opt.outputSchema)
    .query(
      async ({
        input: { search, sort, order, filter, userId, groupId, meta, ...p },
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
              ...(userId ? { authorId: userId } : {}),
              ...(userId || !groupId ? {} : { author: { groupId } }),
              status: PostStatus.PUBLISHED,
            };
            break;
          case AccessLevel.SELF:
            whereQuery = userId
              ? {
                  ...whereQuery,
                  authorId: userId,
                  ...(uid === userId ? {} : { status: PostStatus.PUBLISHED }),
                }
              : {
                  ...whereQuery,
                  ...(groupId ? { author: { groupId: groupId } } : {}),
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
                  ...(userInGroup ? {} : { status: PostStatus.PUBLISHED }),
                }
              : {
                  ...whereQuery,
                  ...(groupId ? { author: { groupId: groupId } } : {}),
                  ...(gid === groupId ? {} : { status: PostStatus.PUBLISHED }),
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

        // TODO to use this, we need client side reconciliation when paginating is out of the boundary
        // const [posts, total] = await prisma.$transaction([
        //   prisma.post.findMany({
        //     where: whereQuery,
        //     orderBy: sort && { [sort]: order },
        //     ...prismaPage,
        //   }),
        //   prisma.post.count({ where: whereQuery }),
        // ]);
        const total = await prisma.post.count({ where: whereQuery });
        const [prismaPage, page] = paginate(p, total);
        const posts = await prisma.post.findMany({
          where: whereQuery,
          orderBy: (sort && opt.sortableColumns.includes(sort) && { [sort]: order }) || undefined,
          ...prismaPage,
        });

        return {
          total,
          ...page,
          items: posts,
          ...(meta === "TRUE"
            ? {
                meta: { columns: opt.columnsMeta },
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
