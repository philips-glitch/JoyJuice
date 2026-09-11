import { requireCurrentUser } from "@/lib/current-user";
import { getCartItems } from "@/lib/cart";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import type { CheckoutCartItem } from "@/lib/checkout-types";

export default async function CheckoutPage() {
  const user = await requireCurrentUser();
  const cartItems = await getCartItems(user.id);

  const items: CheckoutCartItem[] = cartItems.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.product.name,
    image: item.product.image,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    size: item.size,
    iceLevel: item.iceLevel,
    sweetness: item.sweetness,
    toppingIds: JSON.parse(item.toppings) as string[],
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="jj-card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-jj-text">Checkout &amp; Perhitungan Poin</h1>
          <p className="text-sm text-jj-muted">
            Lengkapi detail pengiriman dan gunakan loyalty points Anda untuk potongan langsung.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-jj-green-bg px-3 py-1 text-xs font-semibold text-jj-green">
          🛡 Transaksi Aman &amp; Terenkripsi
        </span>
      </div>

      <CheckoutFlow items={items} user={{ name: user.name, tier: user.tier, points: user.points }} />
    </div>
  );
}
