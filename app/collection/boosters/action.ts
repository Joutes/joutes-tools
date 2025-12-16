"use server";

import {Booster, BoosterCard} from "@/lib/types/booster";
import {revalidatePath} from "next/cache";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {addCardToBoster, createBooster, getBooster, removeCardFromBooster} from "@/lib/data/boosters";
import {redirect} from "next/navigation";

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

  const created = await createBooster(booster);

  revalidatePath("/collection/boosters");
  revalidatePath("/collection/boosters/" + created.id);
  redirect(`/collection/boosters/${created.id}`);
}

export async function removeCardFromBoosterAction(boosterId: string, cardId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  const booster = await getBooster(boosterId);
  if (!booster || booster.userId !== session.user.id) {
    throw new Error("Booster non trouvé ou accès refusé");
  }

  await removeCardFromBooster(boosterId, cardId);

  revalidatePath(`/collection/boosters/${boosterId}`);
}

export async function addCardAction(boosterId: string, card: BoosterCard) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  const booster = await getBooster(boosterId);
  if (!booster || booster.userId !== session.user.id) {
    throw new Error("Booster non trouvé ou accès refusé");
  }

  await addCardToBoster(booster.id, card);

  revalidatePath(`/collection/boosters/${boosterId}`);
}
