import { NextApiRequest, NextApiResponse } from "next";
import nc, { Options } from "next-connect";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import "@/server/utils/server-only";
import { PAGE_SIZE } from "@/data/configs";

export const ncc = <TParams = any, TResponse = any>(
  options: Options<
    NextApiRequest & {
      query: any;
      params: TParams;
    },
    NextApiResponse<TResponse> & {
      ack: (this: NextApiResponse, data: TResponse) => void;
      notFound: (this: NextApiResponse) => void;
    }
  > = {}
) => {
  return nc<
    NextApiRequest & {
      query: any;
      params: TParams;
    },
    NextApiResponse<TResponse> & {
      ack: (this: NextApiResponse, data: TResponse) => void;
      notFound: (this: NextApiResponse) => void;
    }
  >({
    attachParams: true,
    ...options,
  });
};

export const makeEndpoint =
  <TParams, TResponse, TBody, TQuery>(
    schema: {
      params?: z.Schema<TParams>;
      query?: z.Schema<TQuery>;
      body?: z.Schema<TBody>;
      response: z.Schema<TResponse>;
    },
    handler: (
      req: NextApiRequest & {
        query: TQuery;
        params: TParams;
      },
      res: NextApiResponse<TResponse> & {
        ack: (this: NextApiResponse, data: TResponse) => void;
        notFound: (this: NextApiResponse) => void;
      }
    ) => void
  ) =>
  async (
    req: NextApiRequest & { params: TParams },
    res: NextApiResponse & {
      ack: (this: NextApiResponse, data: TResponse) => void;
      notFound: (this: NextApiResponse) => void;
    }
  ) => {
    if (schema.query) {
      const queryResult = schema.query.safeParse(req.query);
      if (!queryResult.success) {
        return res.status(400).json({
          message: `Error in validating URL query: ${fromZodError(
            queryResult!.error
          )}`,
        });
      }
      req.query = queryResult.data as any;
    }
    if (schema.body) {
      const bodyResult = schema.body.safeParse(req.body);
      if (!bodyResult.success)
        return res.status(400).json({
          message: `Error in validating request body: ${fromZodError(
            bodyResult!.error
          )}`,
        });
      req.body = bodyResult.data;
    }
    if (schema.params) {
      const paramsResult = schema.params.safeParse(req.params);
      if (!paramsResult.success)
        return res.status(400).json({
          message: `Error in validating URL params: ${fromZodError(
            paramsResult!.error
          )}`,
        });
      req.params = paramsResult.data as any;
    }

    res.ack = function (this: NextApiResponse, data: TResponse) {
      const dataResult = schema.response?.safeParse(data);
      if (!dataResult?.success)
        throw new Error(
          dataResult?.error
            ? `Error in validating server response: ${fromZodError(
                dataResult.error
              )}`
            : "No schema for server response has been defined!"
        );
      this.send(dataResult.data);
    };

    res.notFound = function (this: NextApiResponse) {
      this.status(404).send({ message: "Resource not found!" });
    };

    return handler(req as any, res as any);
  };

export function paginate({
  offset = 0,
  limit = PAGE_SIZE,
  page,
  page_size,
}: {
  offset?: number;
  limit?: number;
  page?: number;
  page_size?: number;
}) {
  return {
    take: Math.max(page_size || limit, 100),
    skip: page ? (page - 1) * (page_size || PAGE_SIZE) : offset,
  };
}
