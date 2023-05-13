import { z } from "zod";
import { UserModel } from "@/data/models/user";
import { ZPaginated } from "@/data/schemas/ZPaginated";
import { zModelOmitIdAndMeta, zModelOmitMeta } from "@/utils/zod";

const UsersRouteSchemas = {
  "/": {
    get: { response: z.array(zModelOmitMeta(UserModel)), query: ZPaginated },
    post: {
      response: zModelOmitMeta(UserModel),
      body: zModelOmitIdAndMeta(UserModel),
    },
  },
  "/:id": {
    get: {
      response: zModelOmitMeta(UserModel),
      params: z.object({ id: z.coerce.number() }),
    },
    patch: {
      response: zModelOmitMeta(UserModel),
      params: z.object({ id: z.coerce.number() }),
      body: zModelOmitIdAndMeta(UserModel).partial(),
    },
    delete: {
      params: z.object({ id: z.coerce.number() }),
      response: zModelOmitMeta(UserModel),
    },
  },
};

export default UsersRouteSchemas;
export type UsersRouteSchemasType = typeof UsersRouteSchemas;
