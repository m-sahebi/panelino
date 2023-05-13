import { RouteSchemasType } from "@/data/schemas/routes";
import postsRouteHandlers from "@/server/handlers/posts";
import usersRouteHandlers from "@/server/handlers/users";

export const routeHandlers = {
  posts: postsRouteHandlers,
  users: usersRouteHandlers,
} satisfies Record<keyof RouteSchemasType, any>;
// export const routeHandlersList = Object.keys(routeHandlers);

export type RouteHandlersType = typeof routeHandlers;
export type RouteHandlerType = RouteHandlersType[keyof RouteHandlersType];
// export type RouteHandlersPathsType = keyof RouteHandlersType;
