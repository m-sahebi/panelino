import { z } from 'zod';
import nc, { Options } from 'next-connect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';

export const ncc = <TParams, TResData>(
  options: Options<
    NextApiRequest & { params: TParams },
    NextApiResponse<TResData>
  > = {}
) => {
  return nc<NextApiRequest & { params: TParams }, NextApiResponse<TResData>>({
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
      response?: z.Schema<TResponse>;
    },
    cb: (
      req: NextApiRequest & {
        query: TQuery;
        params: TParams;
        session: Session | null;
      },
      res: NextApiResponse<TResponse> & {
        ack: (this: NextApiResponse, data: TResponse) => void;
        notFound: (this: NextApiResponse) => void;
      }
    ) => void
  ) =>
  async (
    req: NextApiRequest & { params: TParams; session: Session | null },
    res: NextApiResponse & {
      ack: (this: NextApiResponse, data: TResponse) => void;
      notFound: (this: NextApiResponse) => void;
    }
  ) => {
    if (schema.query) {
      const queryResult = schema.query.safeParse(req.query);
      if (!queryResult.success) {
        return res.status(400).json({
          message: ['Error in URL query', ...queryResult!.error.errors],
        });
      }
      req.query = queryResult.data as any;
    }
    if (schema.body) {
      const bodyResult = schema.body.safeParse(req.body);
      if (!bodyResult.success)
        return res.status(400).json({
          message: [`Error in request body`, ...bodyResult!.error.errors],
        });
      req.body = bodyResult.data;
    }
    if (schema.params) {
      const paramsResult = schema.params.safeParse(req.params);
      if (!paramsResult.success)
        return res.status(400).json({
          message: [`Error in URL params`, ...paramsResult!.error.errors],
        });
      req.params = paramsResult.data as any;
    }

    // req.session = await getServerSession(req, res, authOptions);

    res.ack = function (this: NextApiResponse, data: TResponse) {
      const dataResult = schema.response?.safeParse(data);
      if (!dataResult?.success)
        throw new Error(
          dataResult?.error.message ||
            'No schema for server response has been defined!'
        );
      this.send(dataResult.data);
    };

    res.notFound = function (this: NextApiResponse) {
      this.status(404).send({ message: 'Resource not found!' });
    };

    return cb(req as any, res as any);
  };
