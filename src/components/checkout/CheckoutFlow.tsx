"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tier } from "@prisma/client";
import {
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/actions/cart-actions";
import {
  applyVoucherAction,
  placeOrderAction,
  type PlaceOrderFormState,
} from "@/app/actions/checkout-actions";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { cartSubtotal, computeOrderTotals, formatRupiah } from "@/lib/pricing";
import { REDEEM_BLOCK_SIZE, type TierConfigMap } from "@/lib/tiers";
import { labelFor, ICE_LEVELS, SWEETNESS_LEVELS } from "@/lib/menu-options";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";
import type { CheckoutCartItem } from "@/lib/checkout-types";

type PaymentMethod = "QRIS" | "VIRTUAL_ACCOUNT" | "MANUAL_TRANSFER";

const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STEPS = [
  { n: 1, label: "Keranjang" },
  { n: 2, label: "Pembayaran" },
] as const;

export function CheckoutFlow({
  items,
  user,
  tierConfig,
}: {
  items: CheckoutCartItem[];
  user: { name: string; tier: Tier; points: number };
  tierConfig: TierConfigMap;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  const [whatsapp, setWhatsapp] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QRIS");
  const [redeemPoints, setRedeemPoints] = useState(false);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discountAmount: number } | null>(
    null,
  );
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherPending, startVoucherTransition] = useTransition();

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);

  const [pending, startTransition] = useTransition();

  const [state, formAction, formPending] = useActionState<PlaceOrderFormState, FormData>(
    placeOrderAction,
    undefined,
  );

  useEffect(() => {
    return () => {
      if (proofPreviewUrl) URL.revokeObjectURL(proofPreviewUrl);
    };
  }, [proofPreviewUrl]);

  const tierInfo = tierConfig[user.tier];
  const subtotal = cartSubtotal(items);
  const pointsToRedeem = redeemPoints && user.points >= REDEEM_BLOCK_SIZE ? REDEEM_BLOCK_SIZE : 0;

  const totals = useMemo(
    () =>
      computeOrderTotals({
        subtotal,
        tier: user.tier,
        tierConfig,
        pointsToRedeem,
        voucherDiscount: appliedVoucher?.discountAmount ?? 0,
      }),
    [subtotal, user.tier, tierConfig, pointsToRedeem, appliedVoucher],
  );

  function handleApplyVoucher() {
    const code = voucherInput.trim();
    if (!code) return;
    setVoucherError(null);
    startVoucherTransition(async () => {
      try {
        const result = await applyVoucherAction(code);
        setAppliedVoucher(result);
      } catch (err) {
        setAppliedVoucher(null);
        setVoucherError(err instanceof Error ? err.message : "Kode voucher tidak valid.");
      }
    });
  }

  function handleRemoveVoucher() {
    setAppliedVoucher(null);
    setVoucherInput("");
    setVoucherError(null);
  }

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

  function handleProofChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setProofError(null);
    setProofPreviewUrl(null);
    setProofFile(null);

    if (!file) return;
    if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
      setProofError("File harus berupa gambar (JPG, PNG, atau WEBP).");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_PROOF_SIZE) {
      setProofError("Ukuran file maksimal 5MB.");
      e.target.value = "";
      return;
    }
    setProofFile(file);
    setProofPreviewUrl(URL.createObjectURL(file));
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
              <h2 className="flex items-center gap-2 font-semibold text-jj-text">
                <Icon name="shopping_cart" className="text-primary" /> Keranjang Anda
              </h2>
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
                    <span className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-jj-bg">
                      <ProductImage image={item.image} alt={item.name} emojiClassName="flex h-full items-center justify-center text-2xl" />
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
                      className="text-jj-muted hover:text-jj-pink"
                      aria-label={`Hapus ${item.name}`}
                    >
                      <Icon name="delete" className="!text-base" />
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
                Lanjut ke Pembayaran →
              </button>
            </div>
          )}

          {step === 2 && (
            <form action={formAction} className="jj-card flex flex-col gap-5 p-5">
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
                <p className="flex items-center gap-1.5 font-semibold">
                  <Icon name="storefront" className="!text-base" /> Ambil Sendiri di Gerai
                </p>
                <p className="mt-1">
                  Joy &amp; Juice belum menyediakan layanan pengiriman — semua pesanan diambil
                  sendiri di gerai setelah pembayaran diverifikasi.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-semibold text-jj-text">
                  Nomor WhatsApp
                  <input
                    name="whatsapp"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+62 812-3456-7890"
                    required
                    className="rounded-xl border border-jj-border px-3 py-2 text-sm font-normal text-jj-text"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-semibold text-jj-text">
                  Catatan Tambahan (opsional)
                  <input
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Contoh: ambil setelah jam 5 sore"
                    className="rounded-xl border border-jj-border px-3 py-2 text-sm font-normal text-jj-text"
                  />
                </label>
              </div>

              <div>
                <h2 className="mb-2 flex items-center gap-2 font-semibold text-jj-text">
                  <Icon name="credit_card" className="text-primary" /> Metode Pembayaran
                </h2>
                <div className="flex flex-col gap-2">
                  <PaymentOption
                    id="QRIS"
                    title="QRIS Instan (Gopay / OVO / ShopeePay / BCA Mobile)"
                    desc="Scan QR lalu upload screenshot bukti bayar di bawah."
                    badge="Instan"
                    selected={paymentMethod === "QRIS"}
                    onSelect={() => setPaymentMethod("QRIS")}
                  />
                  <PaymentOption
                    id="VIRTUAL_ACCOUNT"
                    title="Transfer Virtual Account (BCA, Mandiri, BRI, BNI)"
                    desc="Transfer lalu upload bukti transfer di bawah."
                    selected={paymentMethod === "VIRTUAL_ACCOUNT"}
                    onSelect={() => setPaymentMethod("VIRTUAL_ACCOUNT")}
                  />
                  <PaymentOption
                    id="MANUAL_TRANSFER"
                    title="Transfer Bank Manual (PT Joy and Juice Indonesia)"
                    desc="BCA 782-019-2811 a.n PT Joy and Juice Indonesia"
                    selected={paymentMethod === "MANUAL_TRANSFER"}
                    onSelect={() => setPaymentMethod("MANUAL_TRANSFER")}
                  />
                </div>
              </div>

              <div className="rounded-xl border-2 border-dashed border-jj-orange/50 bg-orange-50/40 p-4">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-jj-text">
                  <Icon name="upload_file" className="!text-base text-primary" /> Upload Bukti
                  Pembayaran
                </p>
                <p className="mb-3 text-xs text-jj-muted">
                  Admin akan memverifikasi bukti ini sebelum pesanan diproses dan poin
                  ditambahkan ke akun Anda.
                </p>

                {/* A single, always-mounted file input — swapping between two
                    separate <input> elements based on state loses the
                    browser's native file selection when React unmounts the
                    first one, so only the surrounding label/preview content
                    changes, never the input itself. */}
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-jj-border bg-white p-3 text-xs text-jj-muted hover:border-jj-orange">
                  {proofPreviewUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a served asset */}
                      <img
                        src={proofPreviewUrl}
                        alt="Preview bukti pembayaran"
                        className="h-16 w-16 flex-shrink-0 rounded-lg border border-jj-border object-cover"
                      />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-emerald-700">
                          ✓ {proofFile?.name}
                        </span>
                        <span className="font-semibold text-jj-orange-dark underline">
                          Ganti file
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex w-full flex-col items-center gap-1 py-4 text-center">
                      <Icon name="add_photo_alternate" className="!text-2xl text-jj-orange" />
                      Klik untuk pilih gambar (JPG/PNG/WEBP, maks 5MB)
                    </div>
                  )}
                  <input
                    type="file"
                    name="paymentProof"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleProofChange}
                    required
                    className="hidden"
                  />
                </label>
                {proofError && <p className="mt-1.5 text-xs text-red-600">{proofError}</p>}
              </div>

              <div className="rounded-xl border border-jj-border p-3">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-jj-text">
                  <Icon name="confirmation_number" className="!text-base text-primary" /> Kode Voucher
                </p>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                    <span className="font-semibold text-emerald-800">
                      &quot;{appliedVoucher.code}&quot; diterapkan — diskon{" "}
                      {formatRupiah(appliedVoucher.discountAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveVoucher}
                      className="text-xs font-semibold text-jj-muted hover:text-jj-pink"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                      placeholder="Masukkan kode voucher"
                      className="flex-1 rounded-xl border border-jj-border px-3 py-2 text-sm uppercase text-jj-text"
                    />
                    <button
                      type="button"
                      disabled={voucherPending || !voucherInput.trim()}
                      onClick={handleApplyVoucher}
                      className="rounded-xl border border-jj-orange px-4 py-2 text-sm font-semibold text-jj-orange-dark disabled:opacity-50"
                    >
                      {voucherPending ? "..." : "Pakai"}
                    </button>
                  </div>
                )}
                {voucherError && (
                  <p className="mt-1.5 text-xs text-red-600">{voucherError}</p>
                )}
                <input type="hidden" name="voucherCode" value={appliedVoucher?.code ?? ""} />
              </div>

              <div className="rounded-xl border border-jj-gold bg-jj-gold-bg p-3">
                <label className="flex items-start gap-2 text-sm text-jj-gold">
                  <input
                    type="checkbox"
                    name="redeemPoints"
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

              {state?.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
                  {state.error}
                </p>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-jj-border px-5 py-2.5 text-sm font-semibold text-jj-muted"
                >
                  ← Kembali
                </button>
                <button
                  type="submit"
                  disabled={formPending || !proofFile}
                  className="jj-btn-primary rounded-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {formPending ? (
                    "Memproses..."
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Icon name="check_circle" filled className="!text-base" />
                      Konfirmasi Pesanan
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          memberDiscount={totals.memberDiscount}
          tierLabel={tierInfo.label}
          pointsDiscount={totals.pointsDiscount}
          voucherDiscount={totals.voucherDiscount}
          voucherCode={appliedVoucher?.code}
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
  id,
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
        <input
          type="radio"
          name="paymentMethod"
          value={id}
          checked={selected}
          onChange={onSelect}
          className="mt-1"
        />
        <span>
          <span className="block font-semibold text-jj-text">{title}</span>
          <span className="text-xs text-jj-muted">{desc}</span>
        </span>
      </span>
      {badge && (
        <span className="flex items-center gap-0.5 whitespace-nowrap rounded-full bg-jj-green-bg px-2 py-0.5 text-[10px] font-semibold text-jj-green">
          <Icon name="bolt" filled className="!text-xs" /> {badge}
        </span>
      )}
    </label>
  );
}
