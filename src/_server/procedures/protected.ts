import { TRPCError } from "@trpc/server";
import { type Permission } from "~/_server/data/roles";
import { publicProcedure, trpcMiddleware } from "~/_server/trpc";

/**
 * Reusable middleware that enforces users are logged in before running the procedure.
 */
const authMiddleware = trpcMiddleware(({ ctx, next, meta }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  const minPerms = meta?.minPermissions;
  const userPermissions = ctx.userPermissions;

  if (
    minPerms &&
    Object.keys(minPerms).some(
      (perm) => (minPerms[perm as Permission] ?? 0) > (userPermissions[perm as Permission] ?? 0),
    )
  )
    throw new TRPCError({ code: "FORBIDDEN" });

  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: ctx.session,
      userPermissions,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = publicProcedure.use(authMiddleware);
