import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/current-user";
import { formatRupiah } from "@/lib/pricing";
import { DELIVERY_OPTIONS } from "@/lib/pricing";
import { labelFor, ICE_LEVELS, SWEETNESS_LEVELS } from "@/lib/menu-options";
import { Icon } from "@/components/Icon";

const PAYMENT_LABELS: Record<string, string> = {
  QRIS: "QRIS Instan",
  VIRTUAL_ACCOUNT: "Transfer Virtual Account",
  MANUAL_TRANSFER: "Transfer Bank Manual",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order || order.userId !== user.id) {
    notFound();
  }

  const deliveryLabel =
    order.deliveryMethod === "PICKUP"
      ? DELIVERY_OPTIONS.PICKUP.STORE.label
      : (DELIVERY_OPTIONS.INSTANT_COURIER as Record<string, { label: string }>)[
          order.deliveryOption
        ]?.label ?? order.deliveryOption;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="jj-card flex flex-col items-center gap-2 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-jj-green-bg text-emerald-600">
          <Icon name="check_circle" filled className="!text-4xl" />
        </span>
        <h1 className="text-2xl font-bold text-jj-text">Pesanan Berhasil Dikonfirmasi!</h1>
        <p className="text-sm text-jj-muted">
          Order #{order.id.slice(-6).toUpperCase()} · {order.createdAt.toLocaleString("id-ID")}
        </p>

        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-jj-gold-bg px-4 py-2 text-sm font-semibold text-jj-gold">
          <Icon name="stars" filled className="!text-base" />
          +{order.pointsEarned} Poin Joy ditambahkan ke akun Anda
        </div>
      </div>

      <div className="jj-card flex flex-col gap-4 p-5">
        <h2 className="font-semibold text-jj-text">Detail Pesanan</h2>
        <div className="flex flex-col gap-3 border-b border-jj-border pb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-jj-bg text-lg">
                  {item.image}
                </span>
                <div>
                  <p className="font-medium text-jj-text">{item.name}</p>
                  <p className="text-xs text-jj-muted">
                    {item.quantity}x · {labelFor(ICE_LEVELS, item.iceLevel)} ·{" "}
                    {labelFor(SWEETNESS_LEVELS, item.sweetness)}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-jj-text">
                {formatRupiah(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1.5 text-sm">
          <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
          <Row label="Pengiriman" value={formatRupiah(order.shippingFee)} />
          {order.memberDiscount > 0 && (
            <Row label="Diskon Member" value={`- ${formatRupiah(order.memberDiscount)}`} />
          )}
          {order.pointsDiscount > 0 && (
            <Row
              label={`Penukaran ${order.pointsRedeemed} Poin`}
              value={`- ${formatRupiah(order.pointsDiscount)}`}
            />
          )}
          <div className="flex items-center justify-between border-t border-jj-border pt-2 font-bold text-jj-text">
            <span>Total Dibayar</span>
            <span className="text-jj-orange-dark">{formatRupiah(order.total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-jj-border pt-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-jj-muted">Metode Pengiriman</p>
            <p className="font-medium text-jj-text">{deliveryLabel}</p>
          </div>
          <div>
            <p className="text-xs text-jj-muted">Metode Pembayaran</p>
            <p className="font-medium text-jj-text">{PAYMENT_LABELS[order.paymentMethod]}</p>
          </div>
          {order.address && (
            <div className="sm:col-span-2">
              <p className="text-xs text-jj-muted">Alamat</p>
              <p className="font-medium text-jj-text">{order.address}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/menu"
          className="jj-btn-primary flex-1 rounded-full px-5 py-3 text-center text-sm font-semibold text-white"
        >
          Belanja Lagi
        </Link>
        <Link
          href="/loyalty"
          className="flex-1 rounded-full border border-jj-border px-5 py-3 text-center text-sm font-semibold text-jj-orange-dark"
        >
          Lihat Poin Saya
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-jj-muted">{label}</span>
      <span className="font-medium text-jj-text">{value}</span>
    </div>
  );
}
