"use client";

import { useSession } from "next-auth/react";

export default function DashPage() {
  const session = useSession();
  return <pre>{JSON.stringify(session.data, null, 2)}</pre>;
}
