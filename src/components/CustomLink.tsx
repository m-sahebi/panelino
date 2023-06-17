import Link from "next/link";
import React from "react";
import { type CustomLinkProps } from "~/utils/ant";
import { cn } from "~/utils/tailwind";

function CustomLink({ children, className, ...props }: CustomLinkProps) {
  return (
    <Link className={cn("text-current no-underline", className)} {...props}>
      {children}
    </Link>
  );
}
