"use server";

import db from "@/lib/mongodb";
import { Errata, ErrataDb } from "@/lib/types/errata";
import { ObjectId } from "bson";

export async function getErratasByCardId(cardId: string): Promise<Errata[]> {
  const erratasDb = await db
    .collection<ErrataDb>("erratas")
    .find({ cardId })
    .sort({ createdAt: -1 })
    .toArray();

  return erratasDb.map((errata) => ({
    id: errata._id.toString(),
    cardId: errata.cardId,
    type: errata.type,
    details: errata.details,
    source: errata.source,
    errataDate: errata.errataDate,
    createdBy: errata.createdBy.toString(),
    createdAt: errata.createdAt,
  }));
}

export async function getAllErratas(): Promise<Errata[]> {
  const erratasDb = await db
    .collection<ErrataDb>("erratas")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return erratasDb.map((errata) => ({
    id: errata._id.toString(),
    cardId: errata.cardId,
    type: errata.type,
    details: errata.details,
    source: errata.source,
    errataDate: errata.errataDate,
    createdBy: errata.createdBy.toString(),
    createdAt: errata.createdAt,
  }));
}
