"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tier } from "@prisma/client";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/actions/cart-actions";
import { placeOrderAction } from "@/app/actions/checkout-actions";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  DELIVERY_OPTIONS,
  cartSubtotal,
  computeOrderTotals,
  formatRupiah,
  shippingFeeFor,
} from "@/lib/pricing";
import { TIER_CONFIG, REDEEM_BLOCK_SIZE } from "@/lib/tiers";
import { labelFor, ICE_LEVELS, SWEETNESS_LEVELS } from "@/lib/menu-options";
import type { CheckoutCartItem } from "@/lib/checkout-types";

type DeliveryMethod = "INSTANT_COURIER" | "PICKUP";
type PaymentMethod = "QRIS" | "VIRTUAL_ACCOUNT" | "MANUAL_TRANSFER";

const STEPS = [
  { n: 1, label: "Keranjang" },
  { n: 2, label: "Pengiriman" },
  { n: 3, label: "Pembayaran & Poin" },
] as const;

export function CheckoutFlow({
  items,
  user,
}: {
  items: CheckoutCartItem[];
  user: { name: string; tier: Tier; points: number };
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("INSTANT_COURIER");
  const [deliveryOption, setDeliveryOption] = useState<string>("GOSEND_GRAB");
  const [address, setAddress] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [driverNote, setDriverNote] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [redeemPoints, setRedeemPoints] = useState(false);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const tierInfo = TIER_CONFIG[user.tier];
  const subtotal = cartSubtotal(items);
  const shippingFee =
    step >= 2 ? shippingFeeFor(deliveryMethod, deliveryOption) : 0;
  const pointsToRedeem = redeemPoints && user.points >= REDEEM_BLOCK_SIZE ? REDEEM_BLOCK_SIZE : 0;

  const totals = useMemo(
    () =>
      computeOrderTotals({
        subtotal,
        shippingFee,
        tier: user.tier,
        pointsToRedeem,
      }),
    [subtotal, shippingFee, user.tier, pointsToRedeem],
  );

  function handleQuantityChange(cartItemId: string, quantity: number) {
    startTransition(async () => {
      await updateCartItemQuantityAction(cartItemId, quantity);
      router.refresh();
    });
  }

  function handleRemove(cartItemId: string) {
    startTransition(async () => {
      await removeCartItemAction(cartItemId);
      router.refresh();
    });
  }

  function handlePlaceOrder() {
    setError(null);
    startTransition(async () => {
      try {
        const { orderId } = await placeOrderAction({
          deliveryMethod,
          deliveryOption,
          address,
          whatsapp,
          driverNote,
          paymentMethod,
          redeemPoints,
        });
        router.push(`/orders/${orderId}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memproses pesanan.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="jj-card flex items-center gap-2 overflow-x-auto p-4 text-xs font-semibold">
        {STEPS.map((s, idx) => (
          <div key={s.n} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full ${
                step >= s.n ? "bg-jj-orange text-white" : "bg-jj-bg text-jj-muted"
              }`}
            >
              {step > s.n ? "✓" : s.n}
            </span>
            <span className={step === s.n ? "text-jj-orange-dark" : "text-jj-muted"}>
              {s.n}. {s.label}
            </span>
            {idx < STEPS.length - 1 && <span className="mx-1 h-px w-8 bg-jj-border" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-4">
          {step === 1 && (
            <div className="jj-card flex flex-col gap-4 p-5">
              <h2 className="font-semibold text-jj-text">🛒 Keranjang Anda</h2>
              {items.length === 0 && (
                <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-jj-muted">
                  <span className="text-4xl">🧃</span>
                  Keranjang masih kosong.
                  <Link
                    href="/menu"
                    className="jj-btn-primary rounded-full px-5 py-2 text-xs font-semibold text-white"
                  >
                    Kembali ke Menu
                  </Link>
                </div>
              )}
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-jj-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-jj-bg text-2xl">
                      {item.image}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-jj-text">{item.name}</p>
                      <p className="text-xs text-jj-muted">
                        {labelFor(ICE_LEVELS, item.iceLevel)} ·{" "}
                        {labelFor(SWEETNESS_LEVELS, item.sweetness)}
                      </p>
                      <p className="text-xs font-semibold text-jj-orange-dark">
                        {formatRupiah(item.unitPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-full border border-jj-border">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="h-7 w-7 text-sm text-jj-text"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-7 w-7 text-sm text-jj-text"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-jj-muted hover:text-jj-pink"
                      aria-label={`Hapus ${item.name}`}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                disabled={items.length === 0}
                onClick={() => setStep(2)}
                className="jj-btn-primary mt-2 self-end rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Lanjut ke Pengiriman →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="jj-card flex flex-col gap-5 p-5">
              <h2 className="font-semibold text-jj-text">🚚 Metode Pengiriman</h2>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod("INSTANT_COURIER");
                    setDeliveryOption("GOSEND_GRAB");
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    deliveryMethod === "INSTANT_COURIER"
                      ? "border-jj-orange bg-orange-50 text-jj-orange-dark"
                      : "border-jj-border text-jj-muted"
                  }`}
                >
                  🛵 Delivery Kurir Instan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeliveryMethod("PICKUP");
                    setDeliveryOption("STORE");
                  }}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium ${
                    deliveryMethod === "PICKUP"
                      ? "border-jj-orange bg-orange-50 text-jj-orange-dark"
                      : "border-jj-border text-jj-muted"
                  }`}
                >
                  🏬 Ambil di Gerai (Pickup)
                </button>
              </div>

              {deliveryMethod === "INSTANT_COURIER" ? (
                <div className="flex flex-col gap-2">
                  {Object.entries(DELIVERY_OPTIONS.INSTANT_COURIER).map(([key, opt]) => (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm ${
                        deliveryOption === key
                          ? "border-jj-orange bg-orange-50"
                          : "border-jj-border"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="deliveryOption"
                          checked={deliveryOption === key}
                          onChange={() => setDeliveryOption(key)}
                        />
                        <span>
                          <span className="block font-semibold text-jj-text">{opt.label}</span>
                          <span className="text-xs text-jj-muted">{opt.eta}</span>
                        </span>
                      </span>
                      <span className="font-semibold text-jj-text">{formatRupiah(opt.fee)}</span>
                    </label>
                  ))}

                  <label className="flex flex-col gap-1 text-xs font-semibold text-jj-text">
                    Alamat Pengiriman Lengkap
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      placeholder="Jl. Contoh No. 1, Patokan terdekat..."
                      className="rounded-xl border border-jj-border px-3 py-2 text-sm font-normal text-jj-text"
                    />
                  </label>
                </div>
              ) : (
                <div className="rounded-xl border border-jj-border p-3 text-sm">
                  <p className="font-semibold text-jj-text">{DELIVERY_OPTIONS.PICKUP.STORE.label}</p>
                  <p className="text-xs text-jj-muted">{DELIVERY_OPTIONS.PICKUP.STORE.eta}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-semibold text-jj-text">
                  Nomor WhatsApp Penerima
                  <input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    className="rounded-xl border border-jj-border px-3 py-2 text-sm font-normal text-jj-text"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-jj-text">
                  Catatan untuk Pengemudi / Barista
                  <input
                    value={driverNote}
                    onChange={(e) => setDriverNote(e.target.value)}
                    placeholder="Tolong sediakan ice gel pack ekstra..."
                    className="rounded-xl border border-jj-border px-3 py-2 text-sm font-normal text-jj-text"
                  />
                </label>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-jj-border px-5 py-2.5 text-sm font-semibold text-jj-muted"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  disabled={!whatsapp.trim() || (deliveryMethod === "INSTANT_COURIER" && !address.trim())}
                  onClick={() => setStep(3)}
                  className="jj-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Lanjut ke Pembayaran →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="jj-card flex flex-col gap-5 p-5">
              <h2 className="font-semibold text-jj-text">💳 Metode Pembayaran</h2>

              <div className="flex flex-col gap-2">
                <PaymentOption
                  id="QRIS"
                  title="QRIS Instan (Gopay / OVO / ShopeePay / BCA Mobile)"
                  desc="Kode QR dinamis ditampilkan setelah Anda konfirmasi pesanan."
                  badge="Instan"
                  selected={paymentMethod === "QRIS"}
                  onSelect={() => setPaymentMethod("QRIS")}
                />
                <PaymentOption
                  id="VIRTUAL_ACCOUNT"
                  title="Transfer Virtual Account (BCA, Mandiri, BRI, BNI)"
                  desc="Verifikasi otomatis dalam 24 jam."
                  selected={paymentMethod === "VIRTUAL_ACCOUNT"}
                  onSelect={() => setPaymentMethod("VIRTUAL_ACCOUNT")}
                />
                <PaymentOption
                  id="MANUAL_TRANSFER"
                  title="Transfer Bank Manual (PT Joy and Juice Indonesia)"
                  desc="BCA 782-019-2811 a.n PT Joy and Juice Indonesia · Verifikasi Admin 5-15 mnt"
                  selected={paymentMethod === "MANUAL_TRANSFER"}
                  onSelect={() => setPaymentMethod("MANUAL_TRANSFER")}
                />
              </div>

              <div className="rounded-xl border border-jj-gold bg-jj-gold-bg p-3">
                <label className="flex items-start gap-2 text-sm text-jj-gold">
                  <input
                    type="checkbox"
                    checked={redeemPoints}
                    disabled={user.points < REDEEM_BLOCK_SIZE}
                    onChange={(e) => setRedeemPoints(e.target.checked)}
                    className="mt-1"
                  />
                  <span>
                    Gunakan {REDEEM_BLOCK_SIZE} Poin untuk diskon{" "}
                    {formatRupiah(REDEEM_BLOCK_SIZE * 100)}
                    <br />
                    <span className="text-xs">
                      Saldo poin saat ini: {user.points.toLocaleString("id-ID")} pts
                      {user.points < REDEEM_BLOCK_SIZE && " (belum cukup untuk ditukar)"}
                    </span>
                  </span>
                </label>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                  {error}
                </p>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-jj-border px-5 py-2.5 text-sm font-semibold text-jj-muted"
                >
                  ← Kembali
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={handlePlaceOrder}
                  className="jj-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {pending ? "Memproses..." : "✓ Konfirmasi Pesanan & Kumpulkan Poin"}
                </button>
              </div>
            </div>
          )}
        </div>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shippingFee={shippingFee}
          memberDiscount={totals.memberDiscount}
          tierLabel={tierInfo.label}
          showShipping={step >= 2}
          showPoints={step >= 3}
          pointsDiscount={totals.pointsDiscount}
          pointsEarned={totals.pointsEarned}
          total={totals.total}
        />
      </div>
    </div>
  );
}

function PaymentOption({
  title,
  desc,
  badge,
  selected,
  onSelect,
}: {
  id: string;
  title: string;
  desc: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border p-3 text-sm ${
        selected ? "border-jj-orange bg-orange-50" : "border-jj-border"
      }`}
    >
      <span className="flex items-start gap-2">
        <input type="radio" name="paymentMethod" checked={selected} onChange={onSelect} className="mt-1" />
        <span>
          <span className="block font-semibold text-jj-text">{title}</span>
          <span className="text-xs text-jj-muted">{desc}</span>
        </span>
      </span>
      {badge && (
        <span className="whitespace-nowrap rounded-full bg-jj-green-bg px-2 py-0.5 text-[10px] font-semibold text-jj-green">
          ⚡ {badge}
        </span>
      )}
    </label>
  );
}
