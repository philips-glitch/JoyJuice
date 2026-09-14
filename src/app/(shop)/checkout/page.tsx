import { requireCurrentUser } from "@/lib/current-user";
import { getCartItems } from "@/lib/cart";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { Icon } from "@/components/Icon";
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
      <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm sm:flex sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Checkout &amp; Perhitungan Poin
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Lengkapi detail pengiriman dan gunakan loyalty points Anda untuk potongan langsung.
          </p>
        </div>
        <span className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 font-label-md text-label-md text-emerald-800 sm:mt-0">
          <Icon name="shield" filled className="!text-sm" />
          Transaksi Aman &amp; Terenkripsi
        </span>
      </div>

      <CheckoutFlow items={items} user={{ name: user.name, tier: user.tier, points: user.points }} />
    </div>
  );
}
