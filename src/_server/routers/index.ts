import { diff } from "radash";
import { z, type ZodObject, type ZodRawShape } from "zod";
import { postsRouter } from "~/_server/routers/posts";
import { usersRouter } from "~/_server/routers/users";
import { createTRPCRouter, publicProcedure } from "~/_server/trpc";
import { type UnionKeys, type UnionToTuple } from "~/utils/type";
import {
  zCreateUnionSchema,
  zParseDef,
  type ZodMainDef,
  type ZodParsedDef,
} from "~/utils/zod";
import "~/_server/utils/server-only";

/**
 * This is the primary router for your server.
 *
 * All routers added in ~/server/routers should be manually added here.
 */
const _routers = {
  users: usersRouter,
  posts: postsRouter,
};
const _routerNames = Object.keys(_routers) as UnionToTuple<keyof typeof _routers>;

const excludedMethods = ["_def", "createCaller", "getErrorShape"];
type _Routers = typeof _routers;
type _RouterNames = keyof _Routers;

/**
 * This router exposes all routers' input and output schema def
 *
 */
export const schemasRouter = createTRPCRouter({
  getRoutes: publicProcedure.query(() => _routerNames),
  getRouteMethods: publicProcedure
    .input(z.object({ route: zCreateUnionSchema(_routerNames) }))
    .query(
      ({ input: { route } }) =>
        diff(Object.keys(_routers[route]), excludedMethods) as UnionToTuple<
          Exclude<keyof _Routers[typeof route], "_def" | "createCaller" | "getErrorShape">
        >,
    ),
  getByName: publicProcedure
    .input(function (val) {
      if (val != null && typeof val === "object")
        if ("name" in val && "method" in val) {
          const { name, method } = val;
          if (typeof name === "string" && typeof method === "string") {
            if (
              name in _routers &&
              method in _routers[name as _RouterNames] &&
              !excludedMethods.includes(method)
            ) {
              const n = name as _RouterNames;
              const m = method as Exclude<
                UnionKeys<_Routers[_RouterNames]>,
                "_def" | "createCaller" | "getErrorShape"
              >;
              return { name: n, method: m };
            }
          }
        }
      throw new Error("Invalid input");
    })
    .query(({ input: { name, method }, ctx }) => {
      const methodDef = (_routers[name]._def.procedures as any)[method]._def;

      const inDef = (methodDef.inputs[0] as ZodObject<ZodRawShape>)._def;
      const outDef = (methodDef.output! as ZodObject<ZodRawShape>)._def;

      return {
        output: zParseDef(outDef) as unknown as ZodParsedDef<ZodMainDef>,
        input: zParseDef(inDef) as unknown as ZodParsedDef<ZodMainDef>,
        isMutation: !!methodDef.mutation,
      };
    }),
});

export const routers = { ..._routers, schemas: schemasRouter };
export type Routers = typeof routers;

export const routerNames = Object.keys(routers) as UnionToTuple<keyof typeof routers>;
export type RouterName = keyof typeof routers;

export const appRouter = createTRPCRouter({
  ...routers,
  schemas: schemasRouter,
});

export type AppRouter = typeof appRouter;
