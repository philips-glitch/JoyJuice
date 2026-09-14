import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config (no Prisma / bcrypt here) so it can run inside
 * middleware. The full config in `src/auth.ts` extends this with the
 * Credentials provider that talks to the database.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      // /login and /signup bounce a signed-in visitor to /menu instead.
      const authPaths = ["/login", "/signup"];
      const isAuthPath = authPaths.some((p) => nextUrl.pathname.startsWith(p));
      if (isAuthPath) {
        if (isLoggedIn) return Response.redirect(new URL("/menu", nextUrl));
        return true;
      }

      // The storefront's menu is browsable by anyone — registration is only
      // required to actually transact (add to cart, checkout, etc.), which
      // is enforced by requireCurrentUser() in those server actions/pages,
      // not here. Exact match only: "/" and "/menu" themselves, not every
      // path that happens to start with "/".
      const publicExactPaths = ["/", "/menu"];
      if (publicExactPaths.includes(nextUrl.pathname)) return true;

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
