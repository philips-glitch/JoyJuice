import Link from "next/link";
import { Icon } from "@/components/Icon";
import { NewCustomerForm } from "@/components/admin/NewCustomerForm";

export default function NewCustomerPage() {
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
          <Icon name="person_add" className="text-primary" /> Pelanggan Baru
        </h1>
      </div>

      <div className="max-w-lg rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm">
        <NewCustomerForm />
      </div>
    </div>
  );
}
