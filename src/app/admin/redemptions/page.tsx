import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { RedemptionsTable } from "@/components/admin/RedemptionsTable";

export default async function AdminRedemptionsPage() {
  // Role is already gated by src/app/admin/layout.tsx.
  const redemptions = await prisma.rewardRedemption.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, username: true } },
      rewardItem: { select: { name: true } },
    },
  });

  const pendingCount = redemptions.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="redeem" className="text-primary" /> Klaim Reward
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Pelanggan menukar poin di sini; klaim setelah item fisik diserahkan langsung ke pelanggan.
          {pendingCount > 0 && (
            <span className="ml-1 font-semibold text-amber-700">
              {pendingCount} menunggu diklaim.
            </span>
          )}
        </p>
      </div>

      <RedemptionsTable
        redemptions={redemptions.map((r) => ({
          id: r.id,
          rewardName: r.rewardItem.name,
          pointsSpent: r.pointsSpent,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          claimedAt: r.claimedAt ? r.claimedAt.toISOString() : null,
          customerName: r.user.name,
          customerUsername: r.user.username,
        }))}
      />
    </div>
  );
}
