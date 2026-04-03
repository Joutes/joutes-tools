"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-utils";
import meilisearch, { indexes } from "@/lib/meilisearch";
import db from "@/lib/mongodb";

export async function setBanStatus(cardId: string, banned: boolean) {
  await requireAdmin();

  const index = meilisearch.index(indexes.riftbound.name);
  await index.updateDocuments([{ id: cardId, banned }]);
  await db.collection("cards").updateOne({ id: cardId }, { $set: { banned } });

  revalidatePath(`/riftbound/cards/${cardId}`);
}
