import { PrismaClient } from "@prisma/client";
import "~/_server/utils/server-only";

const globalForPrisma = globalThis as unknown as { _prisma: PrismaClient | undefined };
export const prisma =
  globalForPrisma._prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma._prisma = prisma;
