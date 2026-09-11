import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same runtime semantics,
// now Node.js by default). This guards every route except the ones in
// `config.matcher` below, redirecting signed-out visitors to /login and
// signed-in visitors away from /login and /signup.
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
