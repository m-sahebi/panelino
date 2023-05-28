import React from "react";
import "~/assets/styles/globals.css";

export const metadata = {
  title: "Posts",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
