import { z } from "zod";
import { PostModel } from "@/data/models/post";
import { ZPaginated } from "@/data/schemas/ZPaginated";
import { zModelOmitIdAndMeta } from "@/utils/zod";

const PostsRouteSchemas = {
  "/": {
    get: { response: z.array(PostModel), query: ZPaginated },
    post: {
      response: PostModel,
      body: zModelOmitIdAndMeta(PostModel),
    },
  },
  "/:id": {
    get: {
      response: PostModel,
      params: z.object({ id: z.coerce.number() }),
    },
    patch: {
      response: PostModel,
      params: z.object({ id: z.coerce.number() }),
      body: zModelOmitIdAndMeta(PostModel).partial(),
    },
    delete: {
      params: z.object({ id: z.coerce.number() }),
      response: PostModel,
    },
  },
};

export default PostsRouteSchemas;
export type PostsRouteSchemasType = typeof PostsRouteSchemas;
