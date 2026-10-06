import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { ScheduleDayEditor } from "@/components/admin/ScheduleDayEditor";
import { WEEKDAYS, todayWeekday } from "@/lib/schedule";

export default async function AdminSchedulePage() {
  const [days, products] = await Promise.all([
    prisma.scheduleDay.findMany({ include: { entries: { select: { productId: true } } } }),
    prisma.product.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        active: true,
        category: { select: { name: true, active: true } },
      },
    }),
  ]);
  const byWeekday = new Map(days.map((d) => [d.weekday, d]));
  const today = todayWeekday();

  // Inactive products / hidden categories stay pickable but are labelled,
  // since they won't show on /jadwal until they're visible on the menu again.
  const productOptions = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category.name,
    hidden: !p.active || !p.category.active,
  }));

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="calendar_month" className="text-primary" /> Jadwal Jus
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Pilih varian yang dibuat tiap hari. Jadwal berulang setiap minggu dan tampil di halaman
          /jadwal — hanya informasi, tidak membatasi pesanan.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {WEEKDAYS.map(({ weekday, label }) => {
          const day = byWeekday.get(weekday);
          return (
            <ScheduleDayEditor
              key={weekday}
              weekday={weekday}
              label={label}
              isToday={weekday === today}
              initialClosed={day?.closed ?? false}
              initialNote={day?.note ?? ""}
              initialProductIds={day?.entries.map((e) => e.productId) ?? []}
              products={productOptions}
            />
          );
        })}
      </div>
    </div>
  );
}
