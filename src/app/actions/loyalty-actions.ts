"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { tierForLifetimePoints } from "@/lib/tiers";
import { getTierConfigMap } from "@/lib/tier-config.server";

/** One-time welcome bonus: +50 points, claimable once per account. */
const SIGNUP_BONUS_POINTS = 50;

export async function claimSignupBonusAction() {
  const user = await requireCurrentUser();
  if (user.bonusClaimed) {
    throw new Error("Bonus poin sudah pernah diklaim.");
  }

  const tierConfig = await getTierConfigMap();

  await prisma.$transaction(async (tx) => {
    // bonusClaimed: false in the filter is what makes this one-shot — a second
    // concurrent claim matches zero rows instead of writing a second ledger row.
    const { count } = await tx.user.updateMany({
      where: { id: user.id, bonusClaimed: false },
      data: {
        bonusClaimed: true,
        points: { increment: SIGNUP_BONUS_POINTS },
        lifetimePoints: { increment: SIGNUP_BONUS_POINTS },
      },
    });
    if (count === 0) {
      throw new Error("Bonus poin sudah pernah diklaim.");
    }

    const fresh = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { points: true, lifetimePoints: true },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { tier: tierForLifetimePoints(fresh.lifetimePoints, tierConfig) },
    });
    await tx.pointsTransaction.create({
      data: {
        userId: user.id,
        type: "BONUS",
        amount: SIGNUP_BONUS_POINTS,
        balanceAfter: fresh.points,
        description: "Bonus poin selamat datang member baru",
      },
    });
  });

  revalidatePath("/loyalty");
  revalidatePath("/menu");
}
