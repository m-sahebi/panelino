export { default } from "next-auth/middleware";

export const config = {
  // Skip all paths that aren't pages that you'd like to internationalize
  matcher: ["/((?!api|auth|_next|favicon.ico|assets).*)"],
};
