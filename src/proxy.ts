import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same runtime semantics,
// now Node.js by default). This guards every route except the ones in
// `config.matcher` below, redirecting signed-out visitors to /login and
// signed-in visitors away from /login and /signup.
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  // Also excludes any request for a static asset (logo.png, icon.png, the
  // Next.js/Vercel default svgs, etc.) — Next's image optimizer fetches
  // these internally without the visitor's session cookie, so gating them
  // behind auth made every <Image> pointed at /public 400 with "not a
  // valid image" instead of actually serving the file.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|avif)$).*)",
  ],
};
