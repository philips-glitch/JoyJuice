import type { ReactNode } from "react";
import { formatRupiah } from "@/lib/pricing";
import type { CheckoutCartItem } from "@/lib/checkout-types";
import { labelFor, ICE_LEVELS, SWEETNESS_LEVELS } from "@/lib/menu-options";
import { Icon } from "@/components/Icon";

export function OrderSummary({
  items,
  subtotal,
  shippingFee,
  memberDiscount,
  tierLabel,
  showShipping,
  showPoints,
  pointsDiscount,
  pointsEarned,
  total,
}: {
  items: CheckoutCartItem[];
  subtotal: number;
  shippingFee: number;
  memberDiscount: number;
  tierLabel: string;
  showShipping: boolean;
  showPoints: boolean;
  pointsDiscount: number;
  pointsEarned: number;
  total: number;
}) {
  return (
    <div className="jj-card sticky top-20 flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold text-jj-text">
          <Icon name="shopping_basket" className="text-primary" /> Ringkasan Pesanan
        </h2>
        <span className="rounded-full bg-jj-gold-bg px-2 py-0.5 text-xs font-semibold text-jj-gold">
          {items.length} Item
        </span>
      </div>

      <div className="flex flex-col gap-3 border-b border-jj-border pb-4">
        {items.length === 0 && (
          <p className="text-sm text-jj-muted">Keranjang Anda masih kosong.</p>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-jj-bg text-lg">
                {item.image}
              </span>
              <div>
                <p className="font-medium text-jj-text">{item.name}</p>
                <p className="text-xs text-jj-muted">
                  {item.quantity} botol x {formatRupiah(item.unitPrice)} ·{" "}
                  {labelFor(ICE_LEVELS, item.iceLevel)} ·{" "}
                  {labelFor(SWEETNESS_LEVELS, item.sweetness)}
                </p>
              </div>
            </div>
            <span className="whitespace-nowrap font-semibold text-jj-text">
              {formatRupiah(item.unitPrice * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <Row label="Subtotal Produk" value={formatRupiah(subtotal)} />
        {showShipping && <Row label="Biaya Pengiriman" value={formatRupiah(shippingFee)} />}
        {memberDiscount > 0 && (
          <Row
            label={
              <>
                <Icon name="sell" className="!text-sm" /> Potongan Diskon Member {tierLabel}
              </>
            }
            value={`- ${formatRupiah(memberDiscount)}`}
            valueClass="text-jj-pink"
          />
        )}
        {showPoints && pointsDiscount > 0 && (
          <Row
            label={
              <>
                <Icon name="stars" filled className="!text-sm text-amber-500" /> Potongan
                Penukaran Poin
              </>
            }
            value={`- ${formatRupiah(pointsDiscount)}`}
            valueClass="text-jj-pink"
          />
        )}
      </div>

      {showPoints && (
        <div className="rounded-xl border border-jj-gold bg-jj-gold-bg p-3 text-xs text-jj-gold">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1">
              <Icon name="stars" filled className="!text-sm text-amber-500" /> Joy &amp; Juice
              Point Rewards
            </span>
            <span className="rounded-full bg-white px-2 py-0.5">{tierLabel} Tier Benefit</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span>Estimasi Poin Didapat</span>
            <span className="text-base font-bold">+{pointsEarned} Poin Joy</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-jj-border pt-4">
        <div>
          <p className="text-xs text-jj-muted">Total Pembayaran Akhir</p>
          <p className="text-[10px] text-jj-muted">Sudah termasuk PPN &amp; packaging</p>
        </div>
        <p className="text-2xl font-extrabold text-jj-orange-dark">{formatRupiah(total)}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: ReactNode;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1 text-jj-muted">{label}</span>
      <span className={`font-medium text-jj-text ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}
