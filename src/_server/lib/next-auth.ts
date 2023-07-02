import "~/_server/utils/server-only";
import crypto from "crypto";
import { UserRole } from "@prisma/client";
import NextAuth, { getServerSession, type AuthOptions, type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { pick } from "radash";
import { prisma } from "~/_server/lib/prisma";
import { verifyPassword } from "~/_server/utils/crypto";
import { IS_DEV } from "~/data/configs";
import { Env } from "~/env";
import { invariant } from "~/utils/primitive";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      groupId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    groupId: string | null;
    accessToken?: string;
  }
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    GithubProvider({
      clientId: Env.GITHUB_ID,
      clientSecret: Env.GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "example@site.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _req) {
        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials?.email.trim().toLowerCase(),
            },
          });

          if (user?.password) {
            if (await verifyPassword(credentials?.password || "", user.password)) return user;
          } else if (IS_DEV) return user;
        } catch (e: any) {
          // eslint-disable-next-line no-console
          console.error(e);
          throw new Error(IS_DEV ? e : "Something went wrong!");
        }
        throw new Error("Email or password is incorrect!");
      },
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
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
                role: UserRole.USER,
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

        invariant(user.email, 'no email for "user" found');

        newToken.picture = `https://www.gravatar.com/avatar/${crypto
          .createHash("md5")
          .update(user.email)
          .digest("hex")}?d=retro`;

        const mainUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (!mainUser)
          throw new Error(`Can't find user with email ${user.email} when creating JWT`);

        if (account.access_token) newToken.accessToken = account.access_token;

        return { ...newToken, ...pick(mainUser, ["id", "name", "role", "groupId"]) };
      }
      return token;
    },
    async session({ session, token, user: _user }) {
      return {
        ...session,
        user: { ...session.user, ...pick(token, ["id", "role", "groupId"]) },
      };
    },
  },
};
export default NextAuth(authOptions);

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
