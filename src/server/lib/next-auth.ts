import crypto from "crypto";
import NextAuth, { AuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { IS_DEV } from "@/data/configs";
import { prisma } from "@/server/lib/prisma";
import { verifyPassword } from "@/server/utils/crypto";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    accessToken?: string;
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@site.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials?.email.trim().toLowerCase(),
            },
          });

          if (user?.password) {
            if (
              await verifyPassword(credentials?.password || "", user.password)
            )
              return user as any;
          } else if (IS_DEV) return user as any;
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(e);
          throw new Error(IS_DEV ? e : "Something went wrong!");
        }
        throw new Error("Email or password is incorrect!");
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      try {
        if (account?.provider === "github") {
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
      if (account) {
        const newToken = { ...token };

        newToken.picture = `https://www.gravatar.com/avatar/${crypto
          .createHash("md5")
          .update(user!.email!)
          .digest("hex")}?d=retro`;

        const mainUser = (await prisma.user.findUnique({
          where: { email: user.email! },
        }))!;

        newToken.name = mainUser.name;
        newToken.id = mainUser.id;
        newToken.accessToken = account.access_token;
        return newToken;
      }
      return token;
    },
    async session({ session, token, user }) {
      const newSession = {
        ...session,
        user: { ...session.user, id: token.id },
      };
      return newSession;
    },
  },
};
export default NextAuth(authOptions);
