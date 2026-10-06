import Link from "next/link";
import { Icon } from "@/components/Icon";
import { ProductImage } from "@/components/ProductImage";
import { getWeeklySchedule, todayWeekday } from "@/lib/schedule";

export default async function JadwalPage() {
  const schedule = await getWeeklySchedule();
  const today = todayWeekday();

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex flex-col gap-1">
        <h1 className="flex items-center gap-2 font-headline-lg text-headline-lg text-on-surface">
          <Icon name="calendar_month" className="text-primary" /> Jadwal Jus
        </h1>
        <p className="max-w-2xl font-body-md text-body-md text-on-surface-variant">
          Varian jus yang kami buat segar setiap hari dalam seminggu. Jadwal ini berulang setiap
          minggu.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {schedule.map((day) => {
          const isToday = day.weekday === today;
          return (
            <section
              key={day.weekday}
              className={`flex flex-col gap-3 rounded-xl border bg-surface-container-lowest p-4 shadow-sm ${
                isToday ? "border-primary ring-2 ring-primary/30" : "border-outline-variant/70"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">{day.label}</h2>
                {isToday && (
                  <span className="rounded-full bg-primary px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-primary">
                    Hari ini
                  </span>
                )}
              </div>

              {day.note && (
                <p className="rounded-lg bg-amber-50 px-3 py-2 font-body-sm text-body-sm text-amber-900">
                  {day.note}
                </p>
              )}

              {day.closed ? (
                <p className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
                  <Icon name="event_busy" className="!text-base" /> Libur — tidak ada produksi
                </p>
              ) : day.products.length === 0 ? (
                <p className="font-body-sm text-body-sm text-outline">Jadwal belum diatur.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {day.products.map((p) => (
                    <li key={p.id} className="flex items-center gap-2.5">
                      <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                        <ProductImage
                          image={p.image}
                          alt={p.name}
                          emojiClassName="flex h-full items-center justify-center text-lg"
                        />
                      </span>
                      <span className="font-body-md text-body-md text-on-surface">{p.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <Link
        href="/menu"
        className="flex w-fit items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
      >
        <Icon name="local_mall" className="!text-sm" />
        <span>Pesan dari Menu</span>
      </Link>
    </div>
  );
}
