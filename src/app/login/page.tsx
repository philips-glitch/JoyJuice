import Image from "next/image";
import { LoginForm } from "@/components/auth/LoginForm";
import { Icon } from "@/components/Icon";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { registered } = await searchParams;

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Image
            src="/logo.png"
            alt="Joy & Juice"
            width={200}
            height={200}
            priority
            className="mx-auto h-20 w-auto"
          />
          <h1 className="mt-4 text-2xl font-bold text-jj-text">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-jj-muted">
            Masuk untuk melanjutkan belanja &amp; kumpulkan poin Joy &amp; Juice
          </p>
        </div>

        {registered && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
            <Icon name="hourglass_top" className="!text-lg text-emerald-600" />
            <span>
              Registrasi berhasil! Akun Anda sedang menunggu verifikasi oleh admin. Anda bisa masuk
              setelah akun diverifikasi.
            </span>
          </div>
        )}

        <div className="jj-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
