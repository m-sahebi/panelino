import { NextApiRequest, NextApiResponse } from "next";
import { HTTP_METHOD } from "next/dist/server/web/http";
import { NextHandler } from "next-connect";
import { ZodSchema } from "zod";

export type HttpMethodType = Lowercase<HTTP_METHOD>;

export type ValidationSchemasGeneralType = {
  query?: ZodSchema;
  params?: ZodSchema;
  body?: ZodSchema;
  response: ZodSchema;
};

export type RouteSchemasGeneralType = {
  [url: string]: {
    [method in HttpMethodType]?: ValidationSchemasGeneralType;
  };
};

export type NCHandlerType = (
  req: NextApiRequest & { query: any; params: any },
  res: NextApiResponse & {
    ack: (this: NextApiResponse, data: any) => void;
    notFound: (this: NextApiResponse) => void;
  },
  next: NextHandler
) => Promise<any>;

export type RouteHandlersGeneralType = {
  middlewares: NCHandlerType[];
  routes: {
    [url: string]: {
      [method in HttpMethodType]?: NCHandlerType;
    };
  };
};
