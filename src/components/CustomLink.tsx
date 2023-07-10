import Link from "next/link";
import React from "react";
import { cn } from "~/utils/tailwind";

export type CustomLinkProps<T = typeof Link> = T extends React.ForwardRefExoticComponent<infer I>
  ? I
  : never;

function CustomLink({ children, className, ...props }: CustomLinkProps) {
  return (
    <Link className={cn("text-current no-underline", className)} {...props}>
      {children}
    </Link>
  );
}
