import NextAuth, { AuthOptions } from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/server/lib/prisma';
import { verifyPassword } from '@/server/utils/crypto';
import { IS_DEV } from '@/data/configs';

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'example@site.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.email.toLowerCase(),
          },
        });

        if (user?.password) {
          if (await verifyPassword(credentials?.password || '', user.password))
            return user as any;
        } else if (IS_DEV) return user as any;

        return null;
      },
    }),
  ],
  pages: {
    // signIn: '/auth/login',
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      try {
        if (account?.provider === 'github') {
          if (!user.email) return false;

          const searchedUser = await prisma.user.findFirst({
            where: {
              email: user.email,
            },
          });

          if (searchedUser?.deletedAt) return false;

          if (!searchedUser)
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                githubId: user.id,
              },
            });
          else
            await prisma.user.update({
              where: { email: user.email },
              data: {
                githubId: user.id,
              },
            });
        }
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token to the token right after signin
      // if (account)
      // eslint-disable-next-line no-param-reassign
      // token.id = `${account.provider}.${account.providerAccountId}`;

      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      // eslint-disable-next-line no-param-reassign
      // session.user = { id: token.id };
      return session;
    },
  },
};
export default NextAuth(authOptions);
