import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl jj-btn-primary text-2xl">
            🧃
          </div>
          <h1 className="mt-4 text-2xl font-bold text-jj-text">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-jj-muted">
            Masuk untuk melanjutkan belanja &amp; kumpulkan poin Joy &amp; Juice
          </p>
        </div>
        <div className="jj-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
