"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

async function requireAdmin() {
  const user = await requireCurrentUser();
  if (user.role !== "ADMIN") {
    throw new Error("Hanya admin yang dapat melakukan aksi ini.");
  }
  return user;
}

/**
 * Marks a reward redemption as claimed: the customer already spent their
 * points at redemption time (see redeemRewardAction), so this only records
 * that an admin has physically handed the item over — it never touches
 * points or reverses anything.
 */
export async function claimRedemptionAction(redemptionId: string) {
  await requireAdmin();

  const redemption = await prisma.rewardRedemption.findUnique({ where: { id: redemptionId } });
  if (!redemption) {
    throw new Error("Penukaran tidak ditemukan.");
  }
  if (redemption.status === "CLAIMED") {
    throw new Error("Penukaran ini sudah diklaim.");
  }

  await prisma.rewardRedemption.update({
    where: { id: redemptionId },
    data: { status: "CLAIMED", claimedAt: new Date() },
  });

  revalidatePath("/admin/redemptions");
  revalidatePath("/rewards");
  revalidatePath("/profile");
}
