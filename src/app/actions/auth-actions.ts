"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

export type AuthFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  email: z.string().trim().email("Format email tidak valid"),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor WhatsApp tidak valid")
    .max(15, "Nomor WhatsApp tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export async function signupAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { fieldErrors };
  }

  const { name, email, phone, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "Email ini sudah terdaftar. Silakan login." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email: normalizedEmail, phone, passwordHash },
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: "/menu",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Akun berhasil dibuat, tapi auto-login gagal. Silakan login manual." };
    }
    throw err; // NEXT_REDIRECT — let Next.js handle the redirect
  }
}

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirectTo: "/menu",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Email atau password salah." };
    }
    throw err; // NEXT_REDIRECT — let Next.js handle the redirect
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
