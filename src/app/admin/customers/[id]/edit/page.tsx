import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { EditCustomerForm } from "@/components/admin/EditCustomerForm";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({ where: { id } });
  if (!customer || customer.role !== "CUSTOMER") notFound();

  const [orderCount, pointsHistory] = await Promise.all([
    prisma.order.count({ where: { userId: id } }),
    prisma.pointsTransaction.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <Link
          href="/admin/customers"
          className="mb-2 flex w-fit items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
        >
          <Icon name="arrow_back" className="!text-base" /> Kembali ke Customers
        </Link>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="edit" className="text-primary" /> Edit: {customer.name}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          @{customer.username} · Bergabung {customer.createdAt.toLocaleDateString("id-ID")} ·{" "}
          {orderCount} pesanan
        </p>
      </div>

      <div className="grid grid-cols-1 gap-space-lg lg:grid-cols-3">
        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm lg:col-span-2">
          <EditCustomerForm
            id={id}
            initialValues={{
              name: customer.name,
              email: customer.email ?? "",
              phone: customer.phone ?? "",
              tier: customer.tier,
              points: customer.points,
              suspended: customer.suspended,
            }}
          />
        </div>

        <div className="rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-3 font-headline-sm text-headline-sm text-on-surface">
            Riwayat Poin Terbaru
          </h2>
          {pointsHistory.length === 0 ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant">Belum ada riwayat.</p>
          ) : (
            <div className="flex flex-col divide-y divide-outline-variant/60">
              {pointsHistory.map((tx) => (
                <div key={tx.id} className="py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-body-sm text-body-sm text-on-surface">
                      {tx.description}
                    </span>
                    <span
                      className={`font-label-sm text-label-sm font-bold ${
                        tx.amount >= 0 ? "text-emerald-700" : "text-secondary"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    {tx.createdAt.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
