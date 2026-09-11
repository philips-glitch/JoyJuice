export type CheckoutCartItem = {
  id: string;
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  size: string;
  iceLevel: string;
  sweetness: string;
  toppingIds: string[];
};
