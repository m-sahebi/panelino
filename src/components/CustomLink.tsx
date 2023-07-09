import Link from "next/link";
import React from "react";
import { CustomLinkProps } from "~/data/types/component";
import { cn } from "~/utils/tailwind";

function CustomLink({ children, className, ...props }: CustomLinkProps) {
  return (
    <Link className={cn("text-current no-underline", className)} {...props}>
      {children}
    </Link>
  );
}
