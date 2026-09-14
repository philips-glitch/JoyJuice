import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { CustomersTable } from "@/components/admin/CustomersTable";

export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      phone: true,
      tier: true,
      points: true,
      suspended: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
            <Icon name="group" className="text-primary" /> Customers
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {customers.length} pelanggan terdaftar.
          </p>
        </div>
        <Link
          href="/admin/customers/new"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 font-label-lg text-label-lg text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
        >
          <Icon name="person_add" className="!text-base" />
          Pelanggan Baru
        </Link>
      </div>

      <CustomersTable
        customers={customers.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() }))}
      />
    </div>
  );
}
