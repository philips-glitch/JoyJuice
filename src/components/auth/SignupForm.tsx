"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthFormState } from "@/app/actions/auth-actions";

const initialState: AuthFormState = undefined;

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Nama Lengkap
        <input
          name="name"
          type="text"
          required
          placeholder="Nama kamu"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
        {fieldErrors.name && <span className="text-xs text-red-600">{fieldErrors.name}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Username
        <input
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="cth: budisantoso123"
          pattern="[A-Za-z0-9]+"
          title="Hanya huruf dan angka, tanpa spasi atau simbol"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
        {fieldErrors.username && (
          <span className="text-xs text-red-600">{fieldErrors.username}</span>
        )}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="nama@email.com"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
        {fieldErrors.email && <span className="text-xs text-red-600">{fieldErrors.email}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Nomor WhatsApp
        <input
          name="phone"
          type="tel"
          required
          placeholder="+62 812-3456-7890"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
        {fieldErrors.phone && <span className="text-xs text-red-600">{fieldErrors.phone}</span>}
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Minimal 8 karakter"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
        {fieldErrors.password && (
          <span className="text-xs text-red-600">{fieldErrors.password}</span>
        )}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="jj-btn-primary mt-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Membuat akun..." : "Daftar & Mulai Kumpulkan Poin"}
      </button>

      <p className="text-center text-sm text-jj-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-jj-orange-dark">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
