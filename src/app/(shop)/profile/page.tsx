import Link from "next/link";
import { requireCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { getTierConfigMap } from "@/lib/tier-config.server";
import { formatRupiah } from "@/lib/pricing";
import { Icon } from "@/components/Icon";

const ORDER_STATUS_STYLES: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  PREPARING: "bg-orange-100 text-orange-800",
  ON_DELIVERY: "bg-sky-100 text-sky-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

const ORDER_STATUS_LABELS: Record<string, string> = {
  PAID: "Berhasil (Diverifikasi Admin)",
  COMPLETED: "Selesai",
  PENDING_PAYMENT: "Menunggu Verifikasi",
  PREPARING: "Diproses",
  ON_DELIVERY: "Dikirim",
  CANCELLED: "Ditolak",
};

const ORDER_STATUS_ICONS: Record<string, string> = {
  PAID: "check_circle",
  COMPLETED: "check_circle",
  PENDING_PAYMENT: "hourglass_top",
  PREPARING: "soup_kitchen",
  ON_DELIVERY: "local_shipping",
  CANCELLED: "cancel",
};

export default async function ProfilePage() {
  const user = await requireCurrentUser();
  const tierConfig = await getTierConfigMap();
  const tierInfo = tierConfig[user.tier];

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { id: true } } },
  });

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const successCount = orders.filter((o) => o.status === "PAID" || o.status === "COMPLETED").length;
  const rejectedCount = orders.filter((o) => o.status === "CANCELLED").length;
  const pendingCount = orders.filter((o) => o.status === "PENDING_PAYMENT").length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Profile detail */}
      <div className="jj-card flex flex-col gap-5 p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-on-primary">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-jj-text">{user.name}</h1>
            <p className="text-sm text-jj-muted">@{user.username}</p>
            <span
              className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: `${tierInfo.color}1a`, color: tierInfo.color }}
            >
              <Icon name="military_tech" filled className="!text-sm" /> Member {tierInfo.label}
            </span>
          </div>
          <Link
            href="/loyalty"
            className="rounded-full border border-jj-border px-4 py-2 text-sm font-semibold text-jj-orange-dark"
          >
            Lihat Poin &amp; Loyalty →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-jj-border pt-5 sm:grid-cols-2">
          <DetailRow icon="mail" label="Email" value={user.email ?? "Belum diisi"} />
          <DetailRow icon="call" label="Nomor WhatsApp" value={user.phone ?? "Belum diisi"} />
          <DetailRow
            icon="calendar_month"
            label="Member Sejak"
            value={user.createdAt.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          />
          <DetailRow
            icon="stars"
            label="Saldo Poin"
            value={`${user.points.toLocaleString("id-ID")} pts`}
          />
        </div>
      </div>

      {/* Transaction history */}
      <div className="jj-card flex flex-col gap-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-jj-text">Riwayat Transaksi</h2>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">
              {successCount} Berhasil
            </span>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-900">
                {pendingCount} Menunggu
              </span>
            )}
            {rejectedCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2.5 py-1 font-semibold text-rose-800">
                {rejectedCount} Ditolak
              </span>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-jj-muted">
            <span className="text-4xl">🧃</span>
            Belum ada transaksi. Yuk mulai belanja!
            <Link
              href="/menu"
              className="jj-btn-primary rounded-full px-5 py-2 text-xs font-semibold text-white"
            >
              Ke Menu
            </Link>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-jj-border">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center justify-between gap-3 py-3.5 text-sm transition-colors hover:bg-jj-bg/60"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                      ORDER_STATUS_STYLES[order.status] ?? "bg-jj-bg text-jj-muted"
                    }`}
                  >
                    <Icon name={ORDER_STATUS_ICONS[order.status] ?? "receipt_long"} filled />
                  </span>
                  <div>
                    <p className="font-medium text-jj-text">
                      Order #{order.id.slice(-6).toUpperCase()} · {order.items.length} item
                    </p>
                    <p className="text-xs text-jj-muted">
                      {order.createdAt.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold text-jj-text">{formatRupiah(order.total)}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      ORDER_STATUS_STYLES[order.status] ?? "bg-jj-bg text-jj-muted"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-jj-bg text-jj-orange-dark">
        <Icon name={icon} className="!text-lg" />
      </span>
      <div>
        <p className="text-xs text-jj-muted">{label}</p>
        <p className="font-medium text-jj-text">{value}</p>
      </div>
    </div>
  );
}
