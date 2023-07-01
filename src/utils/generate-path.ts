export function invariant(value: boolean, message?: string): asserts value;
export function invariant<T>(value: T | null | undefined, message?: string): asserts value is T;
export function invariant(value: any, message?: string) {
  if (value === false || value === null || typeof value === "undefined") {
    throw new Error(message);
  }
}

type _PathParam<Path extends string> =
  // split path into individual path segments
  Path extends `${infer L}/${infer R}`
    ? _PathParam<L> | _PathParam<R>
    : // find params after `:`
    Path extends `:${infer Param}`
    ? Param extends `${infer Optional}?`
      ? Optional
      : Param
    : // otherwise, there aren't any params present
      never;

export type PathParam<Path extends string> =
  // check if path is just a wildcard
  Path extends "*" | "/*"
    ? "*"
    : // look for wildcard at the end of the path
    Path extends `${infer Rest}/*`
    ? "*" | _PathParam<Rest>
    : // look for params in the absence of wildcards
      _PathParam<Path>;

/**
 * Returns a path with params interpolated.
 *
 * @see https://reactrouter.com/utils/generate-path
 */
export function generatePath<Path extends string>(
  originalPath: Path,
  params: {
    [key in PathParam<Path>]: string | null;
  } = {} as any,
): string {
  let path: string = originalPath;
  if (path.endsWith("*") && path !== "*" && !path.endsWith("/*")) {
    console.error(
      false,
      `Route path "${path}" will be treated as if it were ` +
        `"${path.replace(/\*$/, "/*")}" because the \`*\` character must ` +
        `always follow a \`/\` in the pattern. To get rid of this warning, ` +
        `please change the route path to "${path.replace(/\*$/, "/*")}".`,
    );
    path = path.replace(/\*$/, "/*") as Path;
  }

  // ensure `/` is added at the beginning if the path is absolute
  const prefix = path.startsWith("/") ? "/" : "";

  const segments = path
    .split(/\/+/)
    .map((segment, index, array) => {
      const isLastSegment = index === array.length - 1;

      // only apply the splat if it's the last segment
      if (isLastSegment && segment === "*") {
        const star = "*" as PathParam<Path>;
        const starParam = params[star];

        // Apply the splat
        return starParam;
      }

      const keyMatch = segment.match(/^:(\w+)(\??)$/);
      if (keyMatch) {
        const [, key, optional] = keyMatch;
        const param = params[key as PathParam<Path>];

        if (optional === "?") {
          return param == null ? "" : param;
        }

        if (param == null) {
          invariant(false, `Missing ":${key}" param`);
        }

        return param;
      }

      // Remove any optional markers from optional static segments
      return segment.replace(/\?$/g, "");
    })
    // Remove empty segments
    .filter((segment) => !!segment);

  return prefix + segments.join("/");
}
