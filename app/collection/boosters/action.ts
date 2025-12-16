"use server";

import db from "@/lib/mongodb";
import {BoosterDb} from "@/lib/types/booster";
import {ObjectId} from "bson";
import {revalidatePath} from "next/cache";

export async function createBooster(formData: FormData) {
  const gameId = formData.get("gameId") as string;
  const type = formData.get("type") as string;
  const setCode = formData.get("setCode") as string;
  const lang = formData.get("lang") as string;
  
  if (!gameId || !type || !setCode || !lang) {
    return {error: "Tous les champs sont requis"};
  }

  // TODO: Récupérer l'userId depuis la session
  const userId = new ObjectId();

  const booster: BoosterDb = {
    gameId: new ObjectId(gameId),
    userId,
    setCode,
    lang,
    type,
    cards: [],
    archived: false,
    createdAt: new Date(),
  };

  await db.collection<BoosterDb>("boosters").insertOne(booster);

  revalidatePath("/collection/boosters");
  
  return {success: true};
}
