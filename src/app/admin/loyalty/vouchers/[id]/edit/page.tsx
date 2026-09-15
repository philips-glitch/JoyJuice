import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Icon } from "@/components/Icon";
import { VoucherForm } from "@/components/admin/VoucherForm";

export default async function EditVoucherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) notFound();

  return (
    <div className="flex flex-col gap-space-lg">
      <div>
        <Link
          href="/admin/loyalty"
          className="mb-2 flex w-fit items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary"
        >
          <Icon name="arrow_back" className="!text-base" /> Kembali ke Loyalty
        </Link>
        <h1 className="flex items-center gap-2 font-headline-md text-headline-md text-on-surface">
          <Icon name="edit" className="text-primary" /> Edit Voucher: {voucher.code}
        </h1>
      </div>

      <div className="max-w-lg rounded-xl border border-outline-variant/70 bg-surface-container-lowest p-6 shadow-sm">
        <VoucherForm
          id={id}
          initialValues={{
            code: voucher.code,
            discountAmount: voucher.discountAmount,
            minQuantity: voucher.minQuantity,
            maxRedemptions: voucher.maxRedemptions,
            perUserLimit: voucher.perUserLimit,
            expiresAt: voucher.expiresAt ? voucher.expiresAt.toISOString().slice(0, 10) : null,
            active: voucher.active,
          }}
        />
      </div>
    </div>
  );
}
