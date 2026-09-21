import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { ClaimBonusButton } from "@/components/loyalty/ClaimBonusButton";
import { TierLadder } from "@/components/loyalty/TierLadder";
import { Icon } from "@/components/Icon";

const TX_LABELS: Record<string, { icon: string; label: string }> = {
  EARN: { icon: "add_circle", label: "Poin Masuk" },
  REDEEM: { icon: "remove_circle", label: "Poin Ditukar" },
  BONUS: { icon: "redeem", label: "Bonus" },
  ADJUST: { icon: "settings", label: "Penyesuaian" },
};

export default async function LoyaltyPage() {
  const user = await requireCurrentUser();
  const tierConfig = await getTierConfigMap();
  const tierInfo = tierConfig[user.tier];

  const transactions = await prisma.pointsTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="jj-card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: `${tierInfo.color}1a`, color: tierInfo.color }}
          >
            <Icon name="military_tech" filled className="!text-sm" /> Member {tierInfo.label}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-jj-text">
            {user.points.toLocaleString("id-ID")} <span className="text-lg font-medium">Poin</span>
          </h1>
          <p className="text-sm text-jj-muted">
            Total poin yang pernah dikumpulkan: {user.lifetimePoints.toLocaleString("id-ID")} pts ·
            Multiplier {tierInfo.multiplier}x
          </p>
        </div>
        <ClaimBonusButton claimed={user.bonusClaimed} />
      </div>

      <TierLadder
        tier={user.tier}
        lifetimePoints={user.lifetimePoints}
        tierConfig={tierConfig}
      />

      <div className="jj-card flex flex-col gap-4 p-6">
        <h2 className="font-semibold text-jj-text">Riwayat Poin</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-jj-muted">Belum ada riwayat poin. Mulai belanja untuk mengumpulkan poin!</p>
        ) : (
          <div className="flex flex-col divide-y divide-jj-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-jj-bg text-jj-orange-dark">
                    <Icon name={TX_LABELS[tx.type]?.icon ?? "circle"} filled />
                  </span>
                  <div>
                    <p className="font-medium text-jj-text">{tx.description}</p>
                    <p className="text-xs text-jj-muted">
                      {tx.createdAt.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold ${tx.amount >= 0 ? "text-jj-green" : "text-jj-pink"}`}
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
