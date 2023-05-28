import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/_server/routers";
import { createTRPCContext } from "~/_server/trpc";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };
