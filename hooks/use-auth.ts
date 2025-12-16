"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook pour protéger les pages côté client
 * Redirige vers /login si l'utilisateur n'est pas connecté
 */
export function useRequireAuth() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  return { session, isPending };
}

/**
 * Hook pour vérifier si l'utilisateur est connecté
 * Retourne un booléen et l'état de chargement
 */
export function useIsAuthenticated() {
  const { data: session, isPending } = useSession();
  
  return {
    isAuthenticated: !!session,
    isPending,
    session,
  };
}
