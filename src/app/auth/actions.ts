"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export type AuthState = { error: string } | null;

export async function signInWithEmail(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const { error } = await auth.signIn.email({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return { error: error.message || "Unable to sign in." };
  redirect("/");
}

export async function signUpWithEmail(_previous: AuthState, formData: FormData): Promise<AuthState> {
  const { error } = await auth.signUp.email({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });

  if (error) return { error: error.message || "Unable to create your account." };
  redirect("/");
}
