"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";

export async function redeemRewardAction(rewardItemId: string) {
  const user = await requireCurrentUser();
  const reward = await prisma.rewardItem.findUnique({ where: { id: rewardItemId } });

  if (!reward || !reward.active) {
    throw new Error("Reward tidak ditemukan.");
  }
  if (user.points < reward.pointsCost) {
    throw new Error("Poin Anda tidak cukup untuk menukar reward ini.");
  }

  await prisma.$transaction(async (tx) => {
    // The balance check above races: two concurrent redemptions can both pass
    // it off the same read. This conditional decrement is the real guard —
    // the second one matches zero rows and bails.
    const { count } = await tx.user.updateMany({
      where: { id: user.id, points: { gte: reward.pointsCost } },
      data: { points: { decrement: reward.pointsCost } },
    });
    if (count === 0) {
      throw new Error("Poin Anda tidak cukup untuk menukar reward ini.");
    }

    const { points: balanceAfter } = await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      select: { points: true },
    });

    await tx.rewardRedemption.create({
      data: { userId: user.id, rewardItemId: reward.id, pointsSpent: reward.pointsCost },
    });
    await tx.pointsTransaction.create({
      data: {
        userId: user.id,
        type: "REDEEM",
        amount: -reward.pointsCost,
        balanceAfter,
        description: `Tukar poin: ${reward.name}`,
      },
    });
  });

  revalidatePath("/rewards");
  revalidatePath("/loyalty");
  revalidatePath("/menu");
}
