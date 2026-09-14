import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/pricing";
import { Icon } from "@/components/Icon";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  PAID: "bg-emerald-100 text-emerald-800",
  PREPARING: "bg-orange-100 text-orange-800",
  ON_DELIVERY: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  PAID: "Dibayar",
  PREPARING: "Diproses",
  ON_DELIVERY: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

export default async function AdminOrdersPage() {
  // Role is already gated by src/app/admin/layout.tsx.
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, username: true } },
      items: { select: { id: true } },
    },
  });

  const pendingCount = orders.filter((o) => o.status === "PENDING_PAYMENT").length;

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="receipt_long" className="text-primary" /> Orders
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Semua pesanan yang masuk, terbaru di atas.
          {pendingCount > 0 && (
            <span className="ml-1 font-semibold text-amber-700">
              {pendingCount} menunggu verifikasi pembayaran.
            </span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-sm">
        <table className="w-full min-w-[720px] text-left font-body-sm text-body-sm">
          <thead className="border-b border-outline-variant/60 bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-label-md text-label-md">Order</th>
              <th className="px-4 py-3 font-label-md text-label-md">Pelanggan</th>
              <th className="px-4 py-3 font-label-md text-label-md">Item</th>
              <th className="px-4 py-3 font-label-md text-label-md">Total</th>
              <th className="px-4 py-3 font-label-md text-label-md">Status</th>
              <th className="px-4 py-3 font-label-md text-label-md">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-on-surface-variant">
                  Belum ada pesanan masuk.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-surface-container-low">
                <td className="px-4 py-3 font-medium text-on-surface">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    #{order.id.slice(-6).toUpperCase()}
                    {order.status === "PENDING_PAYMENT" && (
                      <Icon name="hourglass_top" className="!text-sm text-amber-600" />
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 text-on-surface">
                  {order.user.name}
                  <span className="block text-on-surface-variant">@{order.user.username}</span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">{order.items.length} item</td>
                <td className="px-4 py-3 font-semibold text-on-surface">
                  {formatRupiah(order.total)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 font-label-sm text-label-sm ${
                      STATUS_STYLES[order.status] ?? "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {order.createdAt.toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
