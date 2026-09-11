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
      const publicPaths = ["/login", "/signup"];
      const isPublicPath = publicPaths.some((p) => nextUrl.pathname.startsWith(p));

      if (isPublicPath) {
        if (isLoggedIn) return Response.redirect(new URL("/menu", nextUrl));
        return true;
      }
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
