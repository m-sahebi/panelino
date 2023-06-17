import { PrismaClient } from "@prisma/client";
import "~/_server/utils/server-only";

const globalForPrisma = global as unknown as {
  vars: { prisma: PrismaClient | undefined };
};

export const prisma =
  globalForPrisma.vars.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.vars.prisma = prisma;
