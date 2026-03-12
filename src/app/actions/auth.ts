"use server";

import { prisma } from "@/lib/prisma";
import { loginToSession, logoutFromSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e senha são obrigatórios." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Credenciais inválidas." };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { error: "Credenciais inválidas." };
  }

  await loginToSession(user);
  redirect("/");
}

export async function logoutAction() {
  await logoutFromSession();
  redirect("/login");
}
