"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { clearSession, setSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    redirect("/login?error=1");
  }

  await setSession(user.id);
  redirect("/companies");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
