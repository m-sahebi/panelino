import "~/env";
import "~/assets/styles/globals.css";
import { getServerSession } from "next-auth";
import { StrictMode, type PropsWithChildren } from "react";
import { authOptions } from "~/_server/lib/next-auth";
import { Providers } from "~/components/Providers";
import { FONT_SANS } from "~/data/configs";
import { cn } from "~/utils/tailwind";

export const metadata = {
  title: {
    default: "Panelino",
    template: "%s | Panelino",
  },
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={cn(FONT_SANS.variable, "font-sans")}>
        <StrictMode>
          <Providers session={session}>{children}</Providers>
        </StrictMode>
      </body>
    </html>
  );
}
