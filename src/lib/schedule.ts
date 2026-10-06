import { prisma } from "@/lib/prisma";

/** ISO weekday numbers (1 = Senin … 7 = Minggu) with their Indonesian names. */
export const WEEKDAYS = [
  { weekday: 1, label: "Senin" },
  { weekday: 2, label: "Selasa" },
  { weekday: 3, label: "Rabu" },
  { weekday: 4, label: "Kamis" },
  { weekday: 5, label: "Jumat" },
  { weekday: 6, label: "Sabtu" },
  { weekday: 7, label: "Minggu" },
] as const;

export function weekdayLabel(weekday: number) {
  return WEEKDAYS.find((d) => d.weekday === weekday)?.label ?? "";
}

const SHORT_TO_ISO: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

/**
 * Today's ISO weekday in the shop's timezone. The server runs in a US region
 * (UTC), so the plain Date#getDay() would still say "yesterday" until 07:00
 * WIB every morning.
 */
export function todayWeekday(now = new Date()) {
  const short = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: "Asia/Jakarta",
  }).format(now);
  return SHORT_TO_ISO[short];
}

export type ScheduleProduct = { id: string; name: string; image: string };

export type ScheduleDayView = {
  weekday: number;
  label: string;
  closed: boolean;
  note: string | null;
  products: ScheduleProduct[];
};

/**
 * The full Senin–Minggu schedule for customers. Products that are inactive
 * or sit in a hidden category are left out, matching what /menu shows.
 */
export async function getWeeklySchedule(): Promise<ScheduleDayView[]> {
  const days = await prisma.scheduleDay.findMany({
    include: {
      entries: {
        where: { product: { active: true, category: { active: true } } },
        include: { product: { select: { id: true, name: true, image: true } } },
        orderBy: { product: { name: "asc" } },
      },
    },
  });
  const byWeekday = new Map(days.map((d) => [d.weekday, d]));

  return WEEKDAYS.map(({ weekday, label }) => {
    const day = byWeekday.get(weekday);
    return {
      weekday,
      label,
      closed: day?.closed ?? false,
      note: day?.note ?? null,
      products: day?.entries.map((e) => e.product) ?? [],
    };
  });
}
