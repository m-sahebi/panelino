import "~/_server/utils/server-only";
import { z } from "zod";
import { IS_DEV } from "~/data/configs";

const EnvSchema = z
  .object({
    NEXT_PUBLIC_BASE_URL: z.string(),

    NEXTAUTH_SECRET: z.string(),
    NEXTAUTH_URL: z.string(),

    GITHUB_ID: z.string(),
    GITHUB_SECRET: z.string(),

    DB_USER: z.string(),
    DB_PASS: z.string(),
    DB_NAME: z.string(),
    DB_BASE_URL: z.string(),
    DB_URL: z.string(),
  })
  .describe("env variables");

export const Env = EnvSchema.parse(process.env);

if (!IS_DEV) console.info("Env vars:", Object.keys(Env));
