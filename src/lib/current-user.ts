import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/** Full DB user for the signed-in session, or null if not signed in. */
export async function getCurrentUser() {
  const session = await auth();
  const id = (session?.user as { id?: string } | undefined)?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/** Same as getCurrentUser but redirects to /login instead of returning null. */
export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
