"use client";

import { useSession } from "next-auth/react";
import { PostModelKeysMeta } from "@/data/models/post";

export default function DashPage() {
  const session = useSession();
  return <pre>{JSON.stringify(PostModelKeysMeta, null, 2)}</pre>;
}
