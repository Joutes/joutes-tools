"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/mongodb";
import { ErrataDb, ErrataType } from "@/lib/types/errata";
import { ObjectId } from "bson";
import { requireAdmin } from "@/lib/auth-utils";

export async function createErrata(data: {
  cardId: string;
  type: ErrataType;
  details: string;
}) {
  await requireAdmin();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  const errata: ErrataDb = {
    cardId: data.cardId,
    type: data.type,
    details: data.details,
    createdBy: new ObjectId(session.user.id),
    createdAt: new Date(),
  };

  await db.collection<ErrataDb>("erratas").insertOne(errata);

  revalidatePath(`/riftbound/cards/${data.cardId}`);
  revalidatePath("/riftbound/erratas");
}

export async function deleteErrata(errataId: string) {
  await requireAdmin();

  await db.collection<ErrataDb>("erratas").deleteOne({ _id: new ObjectId(errataId) });

  revalidatePath("/riftbound/erratas");
}
