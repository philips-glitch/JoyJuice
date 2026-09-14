import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/pricing";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { Icon } from "@/components/Icon";
import type { Tier } from "@prisma/client";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  PAID: "bg-emerald-100 text-emerald-800",
  PREPARING: "bg-orange-100 text-orange-800",
  ON_DELIVERY: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

export default async function AdminDashboardPage() {
  const [
    orderCount,
    revenueAgg,
    customerCount,
    pointsAgg,
    activeProductCount,
    pendingVerificationCount,
    tierGroups,
    recentOrders,
    tierConfig,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.aggregate({ where: { role: "CUSTOMER" }, _sum: { points: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.user.count({ where: { role: "CUSTOMER", verified: false } }),
    prisma.user.groupBy({
      by: ["tier"],
      where: { role: "CUSTOMER" },
      _count: { _all: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, username: true } } },
    }),
    getTierConfigMap(),
  ]);

  const tierCounts = Object.fromEntries(tierGroups.map((g) => [g.tier, g._count._all])) as Record<
    Tier,
    number | undefined
  >;

  const stats = [
    {
      label: "Total Pesanan",
      value: orderCount.toLocaleString("id-ID"),
      icon: "receipt_long",
    },
    {
      label: "Total Pendapatan",
      value: formatRupiah(revenueAgg._sum.total ?? 0),
      icon: "payments",
    },
    {
      label: "Total Pelanggan",
      value: customerCount.toLocaleString("id-ID"),
      icon: "group",
    },
    {
      label: "Poin Beredar",
      value: (pointsAgg._sum.points ?? 0).toLocaleString("id-ID"),
      icon: "stars",
    },
    {
      label: "Produk Aktif",
      value: activeProductCount.toLocaleString("id-ID"),
      icon: "local_drink",
    },
    {
      label: "Menunggu Verifikasi",
      value: pendingVerificationCount.toLocaleString("id-ID"),
      icon: "hourglass_top",
      href: pendingVerificationCount > 0 ? "/admin/customers" : undefined,
      highlight: pendingVerificationCount > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="dashboard" className="text-primary" /> Dashboard
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Ringkasan performa toko Joy &amp; Juice.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((stat) => {
          const cardClass = `flex flex-col gap-2 rounded-xl border p-4 shadow-sm transition-colors ${
            stat.highlight
              ? "border-amber-300 bg-amber-50 hover:bg-amber-100"
              : "border-outline-variant/70 bg-surface-container-lowest"
          }`;
          const content = (
            <>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                  stat.highlight ? "bg-amber-200/70 text-amber-800" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon name={stat.icon} />
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface">{stat.value}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{stat.label}</span>
            </>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href} className={cardClass}>
              {content}
            </Link>
          ) : (
            <div key={stat.label} className={cardClass}>
              {content}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 font-headline-sm text-headline-sm text-on-surface">
            Member per Tier
          </h2>
          <div className="flex flex-col gap-3">
            {(["BRONZE", "SILVER", "GOLD", "PLATINUM"] as const).map((tier) => {
              const count = tierCounts[tier] ?? 0;
              const pct = customerCount > 0 ? Math.round((count / customerCount) * 100) : 0;
              return (
                <div key={tier}>
                  <div className="mb-1 flex items-center justify-between font-label-md text-label-md">
                    <span style={{ color: tierConfig[tier].color }} className="font-bold">
                      {tierConfig[tier].label}
                    </span>
                    <span className="text-on-surface-variant">{count} member</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: tierConfig[tier].color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Pesanan Terbaru</h2>
            <Link href="/admin/orders" className="font-label-md text-label-md text-primary hover:underline">
              Lihat semua →
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Belum ada pesanan masuk.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-outline-variant/60">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">
                      #{order.id.slice(-6).toUpperCase()} · {order.user.name}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      {order.createdAt.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-label-md text-label-md font-semibold text-on-surface">
                      {formatRupiah(order.total)}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm ${
                        STATUS_STYLES[order.status] ?? "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
