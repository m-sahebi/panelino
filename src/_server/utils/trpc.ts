import { type Router } from "@trpc/server";
import { type AnyRouterDef } from "@trpc/server/src/core/router";
import { createTRPCContext } from "~/_server/trpc";

/**
 * Create caller for the router to use on server-side
 */
export async function trpcCreateCaller<T extends AnyRouterDef>(router: Router<T>) {
  return router.createCaller(await createTRPCContext());
}
