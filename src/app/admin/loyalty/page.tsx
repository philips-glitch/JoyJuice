import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { Icon } from "@/components/Icon";
import { TierConfigEditor } from "@/components/admin/TierConfigEditor";
import { VouchersTable } from "@/components/admin/VouchersTable";

export default async function AdminLoyaltyPage() {
  const [tierConfig, vouchers] = await Promise.all([
    getTierConfigMap(),
    prisma.voucher.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { redemptions: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="loyalty" className="text-primary" /> Loyalty Management
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Atur ambang batas tier, multiplier poin, diskon member, dan kode voucher.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="font-headline-sm text-headline-sm text-on-surface">
          Matriks Tier Member
        </h2>
        <TierConfigEditor tierConfig={tierConfig} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Voucher Diskon
          </h2>
          <Link
            href="/admin/loyalty/vouchers/new"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
          >
            <Icon name="add" className="!text-base" />
            Voucher Baru
          </Link>
        </div>
        <VouchersTable
          vouchers={vouchers.map((v) => ({
            id: v.id,
            code: v.code,
            discountAmount: v.discountAmount,
            active: v.active,
            maxRedemptions: v.maxRedemptions,
            perUserLimit: v.perUserLimit,
            expiresAt: v.expiresAt ? v.expiresAt.toISOString() : null,
            redemptionCount: v._count.redemptions,
          }))}
        />
      </section>
    </div>
  );
}
