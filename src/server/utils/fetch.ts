import { headers as getHeaders } from "next/headers";
import { z } from "zod";
import { API_URL } from "@/data/configs";
import { RouteSchemasType } from "@/data/schemas/routes";
import { generatePath, PathParam } from "@/server/utils/generate-path";
import "@/server/utils/server-only";

export type FetchRes<
  TRoute extends keyof RouteSchemasType,
  TPath extends keyof RouteSchemasType[TRoute] = "/",
  // @ts-ignore
  TMethod extends keyof RouteSchemasType[TRoute][TPath] = "get"
> =
  // @ts-ignore
  z.infer<NonNullable<RouteSchemasType[TRoute][TPath][TMethod]["response"]>>;

const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function getServersideHeaders(headers: string[] = ["Cookie"]) {
  const headersInit = new Headers();
  const headersList = getHeaders();
  headers.forEach((key) => {
    const header = headersList.get(key);
    if (header) headersInit.set(key, header);
  });
  return headersInit;
}

export function routeFetch<
  TRoute extends keyof RouteSchemasType,
  TPath extends keyof RouteSchemasType[TRoute] = "/",
  // @ts-ignore
  TMethod extends keyof RouteSchemasType[TRoute][TPath] = "get"
>(
  route: TRoute,
  // @ts-ignore
  path: TPath = "/",
  params: {
    // @ts-ignore
    [key in PathParam<TPath>]: string | null;
  } = {} as any,
  // @ts-ignore
  method: TMethod = "get",
  init: Parameters<typeof fetch>[1] = {}
): Promise<FetchRes<TRoute, TPath, TMethod>> {
  const generatedPath = generatePath(path as string, params);
  const url = `${API_URL}/${route}${generatedPath}`;

  return fetch(url, {
    headers: getServersideHeaders(),
    ...init,
    method: (method as string).toUpperCase(),
  }).then((response) => {
    if (!response.ok) {
      console.error(`${response.status} ${response.statusText} @ ${url}`);
      throw new Error(`${response.status} ${response.statusText} @ ${url}`);
    }
    return response.json() as Promise<FetchRes<TRoute, TPath, TMethod>>;
  });
}

export function tFetch<T>(...args: Parameters<typeof fetch>): Promise<T> {
  const url =
    (typeof args[0] === "string" &&
      !ABSOLUTE_URL_REGEX.test(args[0]) &&
      `${API_URL}/${args[0]}`) ||
    args[0];
  return fetch(url, args[1]).then((response) => {
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  });
}
