import "~/env";
import "~/assets/styles/globals.css";
import { getServerSession } from "next-auth";
import React, { StrictMode } from "react";
import { authOptions } from "~/_server/lib/next-auth";
import { Providers } from "~/components/Providers";
import { FONT_SANS } from "~/data/configs";
import PageLoading from "~/layouts/common/PageLoading";
import { cn } from "~/utils/tailwind";

export const metadata = {
  title: {
    default: "Panelino",
    template: "%s | Panelino",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={cn(FONT_SANS.variable, "font-sans")}>
        <StrictMode>
          <Providers session={session}>
            <PageLoading />
            {children}
          </Providers>
        </StrictMode>
      </body>
    </html>
  );
}
