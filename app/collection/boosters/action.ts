"use server";

import {Booster} from "@/lib/types/booster";
import {revalidatePath} from "next/cache";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {createBooster} from "@/lib/data/boosters";

export async function createBoosterAction(formData: FormData) {
  const gameId = formData.get("gameId") as string;
  const type = formData.get("type") as string;
  const setCode = formData.get("setCode") as string;
  const lang = formData.get("lang") as string;
  
  if (!gameId || !type || !setCode || !lang) {
    return {error: "Tous les champs sont requis"};
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  const booster: Omit<Booster, 'id' | 'createdAt'> = {
    gameId,
    userId: session.user.id,
    setCode,
    lang,
    type,
    cards: [],
    archived: false,
  };

  await createBooster(booster);

  revalidatePath("/collection/boosters");
  
  return {success: true};
}
