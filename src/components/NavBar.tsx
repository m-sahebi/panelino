"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function NavBar() {
  const session = useSession();

  return (
    <nav>
      <Link href="/">Home</Link>
      {session.data ? (
        <>
          {" | "}
          <Link href={{ pathname: "/dash" }}>Dashboard</Link>
          {" | "}
          <Link href="#" onClick={() => void signOut()}>
            Log Out
          </Link>
        </>
      ) : (
        <>
          {" | "}
          <Link href="#" onClick={() => void signIn()}>
            Log in
          </Link>
        </>
      )}
    </nav>
  );
}
