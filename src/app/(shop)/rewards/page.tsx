import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { RewardCard } from "@/components/rewards/RewardCard";

export default async function RewardsPage() {
  const user = await requireCurrentUser();
  const rewards = await prisma.rewardItem.findMany({
    where: { active: true },
    orderBy: { pointsCost: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="jj-card flex flex-col gap-2 bg-gradient-to-r from-jj-orange to-jj-pink p-8 text-white">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
          Katalog Rewards
        </span>
        <h1 className="text-2xl font-bold">Tukar Poin Joy Anda</h1>
        <p className="max-w-xl text-sm text-white/90">
          Saldo poin Anda saat ini: <strong>{user.points.toLocaleString("id-ID")} pts</strong>.
          Pilih reward di bawah ini dan tukarkan langsung tanpa syarat tersembunyi.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) => (
          <RewardCard key={reward.id} reward={reward} userPoints={user.points} />
        ))}
      </div>
    </div>
  );
}
