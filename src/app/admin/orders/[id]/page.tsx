import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/pricing";
import { labelFor, SWEETNESS_LEVELS } from "@/lib/menu-options";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";
import { OrderVerifyActions } from "@/components/admin/OrderVerifyActions";

const STATUS_STYLES: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-900",
  PAID: "bg-emerald-100 text-emerald-800",
  PREPARING: "bg-orange-100 text-orange-800",
  ON_DELIVERY: "bg-sky-100 text-sky-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: "Menunggu Verifikasi Pembayaran",
  PAID: "Dibayar",
  PREPARING: "Diproses",
  ON_DELIVERY: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

const PAYMENT_LABELS: Record<string, string> = {
  QRIS: "QRIS Instan",
  VIRTUAL_ACCOUNT: "Transfer Virtual Account",
  MANUAL_TRANSFER: "Transfer Bank Manual",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      user: { select: { name: true, username: true, email: true, phone: true } },
    },
  });
  if (!order) notFound();

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <Link
          href="/admin/orders"
          className="mb-2 flex w-fit items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
        >
          <Icon name="arrow_back" className="!text-base" /> Kembali ke Orders
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
            <Icon name="receipt_long" className="text-primary" /> Order #
            {order.id.slice(-6).toUpperCase()}
          </h1>
          <span
            className={`rounded-full px-3 py-1 font-label-md text-label-md ${
              STATUS_STYLES[order.status] ?? "bg-surface-container text-on-surface-variant"
            }`}
          >
            {STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {order.createdAt.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        <div className="flex flex-col gap-space-lg lg:col-span-2">
          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">
              Item Pesanan
            </h2>
            <div className="flex flex-col divide-y divide-outline-variant/60">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                      <ProductImage
                        image={item.image}
                        alt={item.name}
                        emojiClassName="flex h-full items-center justify-center text-xl"
                      />
                    </span>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{item.name}</p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {item.quantity}x · {labelFor(SWEETNESS_LEVELS, item.sweetness)}
                      </p>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    {formatRupiah(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-1.5 border-t border-outline-variant/60 pt-3 font-body-sm text-body-sm">
              <Row label="Subtotal" value={formatRupiah(order.subtotal)} />
              {order.memberDiscount > 0 && (
                <Row label="Diskon Member" value={`- ${formatRupiah(order.memberDiscount)}`} />
              )}
              {order.pointsDiscount > 0 && (
                <Row
                  label={`Penukaran ${order.pointsRedeemed} Poin`}
                  value={`- ${formatRupiah(order.pointsDiscount)}`}
                />
              )}
              {order.voucherDiscount > 0 && (
                <Row
                  label={`Voucher${order.voucherCode ? ` "${order.voucherCode}"` : ""}`}
                  value={`- ${formatRupiah(order.voucherDiscount)}`}
                />
              )}
              <div className="flex items-center justify-between border-t border-outline-variant/60 pt-2 font-bold text-on-surface">
                <span>Total</span>
                <span>{formatRupiah(order.total)}</span>
              </div>
              <p className="text-on-surface-variant">
                Poin yang akan didapat customer: <strong>+{order.pointsEarned}</strong>{" "}
                {order.pointsCredited ? "(sudah dikreditkan)" : "(setelah verifikasi)"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">
              Bukti Pembayaran
            </h2>
            {order.paymentProofUrl ? (
              <a href={order.paymentProofUrl} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element -- external Blob storage URL */}
                <img
                  src={order.paymentProofUrl}
                  alt="Bukti pembayaran"
                  className="max-h-96 w-full rounded-lg border border-outline-variant object-contain"
                />
              </a>
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Tidak ada bukti pembayaran yang diupload.
              </p>
            )}

            {order.status === "PENDING_PAYMENT" && (
              <div className="mt-4">
                <OrderVerifyActions orderId={order.id} />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-space-lg">
          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">Pelanggan</h2>
            <p className="font-label-md text-label-md text-on-surface">{order.user.name}</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              @{order.user.username}
            </p>
            {order.user.email && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {order.user.email}
              </p>
            )}
            <p className="mt-2 font-body-sm text-body-sm text-on-surface-variant">
              WhatsApp: {order.whatsapp}
            </p>
            {order.driverNote && (
              <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
                Catatan: {order.driverNote}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">Pembayaran</h2>
            <p className="font-label-md text-label-md text-on-surface">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Pengambilan: Ambil Sendiri di Gerai
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}
