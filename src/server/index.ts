import { IS_DEV } from "@/data/configs";
import { routeHandlers, RouteHandlerType } from "@/server/handlers";
import { ncc } from "@/server/utils/handler";
import { HttpMethodType, NCHandlerType } from "@/server/utils/types";

const handler = ncc({
  onError(err, req, res) {
    // eslint-disable-next-line no-console
    console.error(err);
    res
      .status(500)
      .send(
        IS_DEV
          ? { message: err.toString() }
          : { message: "Something went wrong!" }
      );
  },
  onNoMatch(req, res) {
    res.status(404).end("Not found!");
  },
});

export const convertRoute = (routeHandler: RouteHandlerType) => {
  const n = ncc();
  routeHandler.middlewares.forEach((mw: NCHandlerType) => n.use(mw));
  Object.entries(routeHandler.routes).forEach(([path, handlers]) => {
    Object.entries(handlers).forEach(([method, handlerFn]) => {
      n[method as HttpMethodType](path, handlerFn as NCHandlerType);
    });
  });
  return n;
};
Object.entries(routeHandlers).forEach(
  ([path, val]: [string, RouteHandlerType]) => {
    handler.use(`/api/${path}`, convertRoute(val));
  }
);

export default handler;
