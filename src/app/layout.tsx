import { getServerSession } from "next-auth";
import React from "react";
import Providers from "@/components/Providers";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import "@/assets/styles/globals.css";

export const metadata = {
  title: {
    default: "Panelino",
    template: "%s | Panelino",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  );
}
