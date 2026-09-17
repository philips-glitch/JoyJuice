import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { RewardCard } from "@/components/rewards/RewardCard";
import { TicketRewardCard } from "@/components/rewards/TicketRewardCard";
import { Icon } from "@/components/Icon";

// Only this specific reward gets the physical-coupon "ticket" styling —
// everything else on this page keeps the plain RewardCard look.
const TICKET_REWARD_NAME = "1 Botol Jus Gratis (Semua Varian) 250ml";

export default async function RewardsPage() {
  const user = await requireCurrentUser();
  const [rewards, myRedemptions] = await Promise.all([
    prisma.rewardItem.findMany({
      where: { active: true },
      orderBy: { pointsCost: "asc" },
    }),
    prisma.rewardRedemption.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { rewardItem: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary p-8 text-white shadow-sm">
        <span className="w-fit rounded-full bg-white/20 px-3 py-1 font-label-md text-label-md font-semibold">
          Katalog Rewards
        </span>
        <h1 className="flex items-center gap-2 font-headline-lg text-headline-lg">
          <Icon name="redeem" filled /> Tukar Poin Joy Anda
        </h1>
        <p className="max-w-xl font-body-md text-body-md text-white/90">
          Saldo poin Anda saat ini: <strong>{user.points.toLocaleString("id-ID")} pts</strong>.
          Pilih reward di bawah ini dan tukarkan langsung tanpa syarat tersembunyi.
        </p>
      </div>

      {/* Same 3-across grid for every reward — the ticket card is sized to
          sit proportionally as one cell here, not stretch full width. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward) =>
          reward.name === TICKET_REWARD_NAME ? (
            <TicketRewardCard key={reward.id} reward={reward} userPoints={user.points} />
          ) : (
            <RewardCard key={reward.id} reward={reward} userPoints={user.points} />
          ),
        )}
      </div>

      {myRedemptions.length > 0 && (
        <div className="jj-card flex flex-col gap-4 p-6">
          <h2 className="font-semibold text-jj-text">Riwayat Penukaran</h2>
          <div className="flex flex-col divide-y divide-jj-border">
            {myRedemptions.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3.5 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                      r.status === "CLAIMED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    <Icon name={r.status === "CLAIMED" ? "check_circle" : "hourglass_top"} filled />
                  </span>
                  <div>
                    <p className="font-medium text-jj-text">{r.rewardItem.name}</p>
                    <p className="text-xs text-jj-muted">{r.createdAt.toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-jj-text">
                    -{r.pointsSpent.toLocaleString("id-ID")} pts
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      r.status === "CLAIMED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {r.status === "CLAIMED" ? "Sudah Diklaim" : "Menunggu Klaim Admin"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
