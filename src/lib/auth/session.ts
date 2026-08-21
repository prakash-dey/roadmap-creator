import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function getAuthenticatedUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/auth/sign-in");
  return user;
}
