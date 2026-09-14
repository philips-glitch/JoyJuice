export type SizeOption = { id: string; label: string; priceDelta: number };
export type ToppingOption = { id: string; label: string; priceDelta: number };

/** Ice level and sweetness are global options shared by every product. */
export const ICE_LEVELS = [
  { id: "normal", label: "Normal Es" },
  { id: "less", label: "Sedikit Es" },
  { id: "none", label: "Tanpa Es (Chilled)" },
] as const;

export const SWEETNESS_LEVELS = [
  { id: "pure", label: "100% Tanpa Gula" },
  { id: "less_sweet", label: "Less Sugar" },
  { id: "normal_sweet", label: "Normal Sugar" },
] as const;

export type IceLevelId = (typeof ICE_LEVELS)[number]["id"];
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
