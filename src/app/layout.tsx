import { getServerSession } from "next-auth";
import React, { StrictMode } from "react";
import { authOptions } from "~/_server/lib/next-auth";
import { Providers } from "~/components/Providers";
import "~/assets/styles/globals.css";

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
      <body>
        <StrictMode>
          <Providers session={session}>{children}</Providers>
        </StrictMode>
      </body>
    </html>
  );
}
