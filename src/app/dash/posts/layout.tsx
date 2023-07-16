import type React from "react";
import "~/assets/styles/globals.scss";

export const metadata = {
  title: "Posts",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
