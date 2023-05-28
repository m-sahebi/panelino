import { Router } from "@trpc/server";
import { AnyRouterDef } from "@trpc/server/src/core/router";
import { createTRPCContext } from "~/_server/trpc";

/**
 * Create caller for the router to use on server-side
 */
export async function trpcCreateCaller<T extends AnyRouterDef>(router: Router<T>) {
  const caller = await router.createCaller(await createTRPCContext());
  return caller;
}
