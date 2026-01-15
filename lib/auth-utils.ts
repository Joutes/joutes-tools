import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const ADMIN_EMAILS = ["nakasar@outlook.fr"];

export async function isAdmin(): Promise<boolean> {
  const session = await auth.api.getSession({ headers: await headers() });
  
  if (!session?.user?.email) {
    return false;
  }

  return ADMIN_EMAILS.includes(session.user.email);
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  
  if (!admin) {
    throw new Error("Accès réservé aux administrateurs");
  }
}
