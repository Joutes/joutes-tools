"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/mongodb";
import { ErrataDb, ErrataType } from "@/lib/types/errata";
import { ObjectId } from "bson";
import { requireAdmin } from "@/lib/auth-utils";
import {requirePermission} from "@/lib/permissions";

export async function createErrata(data: {
  cardId: string;
  type: ErrataType;
  details: string;
  source?: string;
  errataDate: Date;
}) {
  await requirePermission("erratas:update");

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  const errata: ErrataDb = {
    cardId: data.cardId,
    type: data.type,
    details: data.details,
    source: data.source,
    errataDate: data.errataDate,
    createdBy: new ObjectId(session.user.id),
    createdAt: new Date(),
  };

  await db.collection<ErrataDb>("erratas").insertOne(errata);

  revalidatePath(`/riftbound/cards/${data.cardId}`);
  revalidatePath("/riftbound/erratas");
}

export async function updateErrata(
  errataId: string,
  data: {
    type: ErrataType;
    details: string;
    source?: string;
    errataDate: Date;
    deprecatedAt?: Date | null;
  },
  cardId?: string
) {
  await requirePermission("erratas:update");

  const updateFields: Partial<ErrataDb> = {
    type: data.type,
    details: data.details,
    source: data.source,
    errataDate: data.errataDate,
  };

  if (data.deprecatedAt !== undefined) {
    if (data.deprecatedAt === null) {
      await db.collection<ErrataDb>("erratas").updateOne(
        { _id: new ObjectId(errataId) },
        { $set: updateFields, $unset: { deprecatedAt: "" } }
      );
    } else {
      updateFields.deprecatedAt = data.deprecatedAt;
      await db.collection<ErrataDb>("erratas").updateOne(
        { _id: new ObjectId(errataId) },
        { $set: updateFields }
      );
    }
  } else {
    await db.collection<ErrataDb>("erratas").updateOne(
      { _id: new ObjectId(errataId) },
      { $set: updateFields }
    );
  }

  revalidatePath("/riftbound/erratas");
  if (cardId) {
    revalidatePath(`/riftbound/cards/${cardId}`);
  }
}

export async function deleteErrata(errataId: string, cardId?: string) {
  await requirePermission("erratas:update");

  await db.collection<ErrataDb>("erratas").deleteOne({ _id: new ObjectId(errataId) });

  revalidatePath("/riftbound/erratas");
  if (cardId) {
    revalidatePath(`/riftbound/cards/${cardId}`);
  }
}
