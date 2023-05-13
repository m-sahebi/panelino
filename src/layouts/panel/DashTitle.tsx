"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { capitalize } from "radash";
import React from "react";

export default function DashTitle() {
  const segment = useSelectedLayoutSegment();

  return (
    <>
      <h1>{capitalize(segment || "Dashboard")}</h1>
    </>
  );
}
