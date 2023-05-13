import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { NextHandler } from "next-connect";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import "@/server/utils/server-only";

export const authenticationMiddleware =
  (preventAccess = true) =>
  async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    const session = await getServerSession(req, res, authOptions);
    if (preventAccess && !session) {
      return res.status(401).send({ message: "No valid token!" });
    }

    return next();
  };
