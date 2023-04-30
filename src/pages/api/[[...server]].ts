import { IS_DEV } from '@/data/configs';
import { ncc } from '@/server/lib/nc';
import userRoute from '@/server/routes/users';

const handler = ncc({
  onError(err, req, res) {
    // eslint-disable-next-line no-console
    console.error(err);
    res
      .status(500)
      .send(
        IS_DEV
          ? { message: err.toString() }
          : { message: 'Something went wrong!' }
      );
  },
  onNoMatch(req, res) {
    res.status(404).end('Not found!');
  },
});

handler.use('/api/users', userRoute);

export default handler;
