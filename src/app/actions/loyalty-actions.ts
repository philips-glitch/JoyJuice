"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { tierForLifetimePoints } from "@/lib/tiers";

/** One-time welcome bonus: +100 points, claimable once per account. */
const SIGNUP_BONUS_POINTS = 100;

export async function claimSignupBonusAction() {
  const user = await requireCurrentUser();
  if (user.bonusClaimed) {
    throw new Error("Bonus poin sudah pernah diklaim.");
  }

  const newLifetimePoints = user.lifetimePoints + SIGNUP_BONUS_POINTS;
  const newPoints = user.points + SIGNUP_BONUS_POINTS;
  const newTier = tierForLifetimePoints(newLifetimePoints);

  await prisma.$transaction([
    prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        type: "BONUS",
        amount: SIGNUP_BONUS_POINTS,
        balanceAfter: newPoints,
        description: "Bonus poin selamat datang member baru",
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        points: newPoints,
        lifetimePoints: newLifetimePoints,
        tier: newTier,
        bonusClaimed: true,
      },
    }),
  ]);

  revalidatePath("/loyalty");
  revalidatePath("/menu");
}
