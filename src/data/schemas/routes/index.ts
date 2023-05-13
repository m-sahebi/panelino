import PostsRouteSchemas from "@/data/schemas/routes/posts";
import UsersRouteSchemas from "@/data/schemas/routes/users";
import { RouteSchemasGeneralType } from "@/server/utils/types";

export const RouteSchemas = {
  posts: PostsRouteSchemas,
  users: UsersRouteSchemas,
} satisfies Record<any, RouteSchemasGeneralType>;

export type RouteSchemasType = typeof RouteSchemas;
export type RoutePathType = keyof RouteSchemasType;
export type RouteSchemaType = RouteSchemasType[RoutePathType];

export const routePaths = Object.keys(RouteSchemas) as RoutePathType[];
