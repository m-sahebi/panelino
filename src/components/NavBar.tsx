"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function NavBar() {
  const session = useSession();

  return (
    <nav>
      <Link href={"/"}>Home</Link>
      {session.data ? (
        <>
          {" | "}
          <Link href={"/dash"}>Dashboard</Link>
          {" | "}
          <Link href="#" onClick={() => signOut()}>
            Log Out
          </Link>
        </>
      ) : (
        <>
          {" | "}
          <Link href="#" onClick={() => signIn()}>
            Log in
          </Link>
        </>
      )}
    </nav>
  );
}
