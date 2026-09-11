"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";

export type AuthFormState =
  | { error?: string; fieldErrors?: Record<string, string> }
  | undefined;

const USERNAME_REGEX = /^[a-z0-9_.]+$/;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, "Username minimal 3 karakter")
    .max(20, "Username maksimal 20 karakter")
    .regex(USERNAME_REGEX, "Hanya huruf kecil, angka, titik, dan underscore"),
  email: z.string().trim().toLowerCase().email("Format email tidak valid"),
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
    username: formData.get("username"),
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

  const { name, username, email, phone, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email }] },
  });
  if (existing) {
    return {
      error:
        existing.username === username
          ? "Username ini sudah dipakai. Silakan pilih yang lain."
          : "Email ini sudah terdaftar. Silakan login.",
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, username, email, phone, passwordHash },
  });

  try {
    await signIn("credentials", {
      identifier: username,
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
  const identifier = formData.get("identifier");
  const password = formData.get("password");

  if (
    typeof identifier !== "string" ||
    typeof password !== "string" ||
    !identifier ||
    !password
  ) {
    return { error: "Username/email dan password wajib diisi." };
  }

  try {
    await signIn("credentials", {
      identifier: identifier.trim().toLowerCase(),
      password,
      redirectTo: "/menu",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Username/email atau password salah." };
    }
    throw err; // NEXT_REDIRECT — let Next.js handle the redirect
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
