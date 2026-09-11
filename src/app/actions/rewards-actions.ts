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

  const newBalance = user.points - reward.pointsCost;

  await prisma.$transaction([
    prisma.rewardRedemption.create({
      data: { userId: user.id, rewardItemId: reward.id, pointsSpent: reward.pointsCost },
    }),
    prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        type: "REDEEM",
        amount: -reward.pointsCost,
        balanceAfter: newBalance,
        description: `Tukar poin: ${reward.name}`,
      },
    }),
    prisma.user.update({ where: { id: user.id }, data: { points: newBalance } }),
  ]);

  revalidatePath("/rewards");
  revalidatePath("/loyalty");
  revalidatePath("/menu");
}
