import Image from "next/image";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
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
          <h1 className="mt-4 text-2xl font-bold text-jj-text">Buat Akun Joy &amp; Juice</h1>
          <p className="mt-1 text-sm text-jj-muted">
            Daftar gratis, dapatkan poin di setiap pembelian jus segar
          </p>
        </div>
        <div className="jj-card p-6 shadow-sm">
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
