"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthFormState } from "@/app/actions/auth-actions";

const initialState: AuthFormState = undefined;

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200">
          {state.error}
        </p>
      )}

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Username atau Email
        <input
          name="identifier"
          type="text"
          required
          autoComplete="username"
          placeholder="username atau nama@email.com"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-jj-text">
        Password
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="rounded-xl border border-jj-border bg-white px-3.5 py-2.5 text-sm outline-none focus:border-jj-orange"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="jj-btn-primary mt-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Masuk..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-jj-muted">
        Belum punya akun?{" "}
        <Link href="/signup" className="font-semibold text-jj-orange-dark">
          Daftar sekarang
        </Link>
      </p>

      <div className="mt-1 flex flex-col gap-1 rounded-xl bg-jj-gold-bg px-3.5 py-2.5 text-xs text-jj-gold">
        <span>
          Demo customer: <span className="font-semibold">customer</span> /{" "}
          <span className="font-semibold">123456</span>
        </span>
        <span>
          Demo admin: <span className="font-semibold">admin</span> /{" "}
          <span className="font-semibold">123456</span>
        </span>
        <span>
          Demo Gold member: <span className="font-semibold">budisantoso</span> /{" "}
          <span className="font-semibold">password123</span>
        </span>
      </div>
    </form>
  );
}
