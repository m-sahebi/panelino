import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import { getServerSession, Session } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export const authenticateMiddleware =
  () =>
  async (
    req: NextApiRequest & { session: Session },
    res: NextApiResponse,
    next: NextHandler
  ) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).send({ message: 'No valid token!' });
    }
    req.session = session;
    return next();
  };
