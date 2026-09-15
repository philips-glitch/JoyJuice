export type SizeOption = { id: string; label: string; priceDelta: number };
export type ToppingOption = { id: string; label: string; priceDelta: number };

/**
 * Ice level is no longer a customer-facing choice (every bottle is made the
 * same way), but CartItem/OrderItem still have a NOT NULL `iceLevel` column
 * for historical orders, so every new cart item is created with this fixed
 * value rather than migrating the column away.
 */
export const DEFAULT_ICE_LEVEL = "normal";

export const SWEETNESS_LEVELS = [
  { id: "pure", label: "100% Tanpa Gula" },
  { id: "less_sweet", label: "Less Sugar" },
  { id: "normal_sweet", label: "Normal Sugar" },
] as const;

export type SweetnessId = (typeof SWEETNESS_LEVELS)[number]["id"];

export function parseSizes(json: string): SizeOption[] {
  return JSON.parse(json);
}

export function parseToppings(json: string): ToppingOption[] {
  return JSON.parse(json);
}

export function labelFor<T extends { id: string; label: string }>(
  options: readonly T[],
  id: string,
): string {
  return options.find((o) => o.id === id)?.label ?? id;
}
