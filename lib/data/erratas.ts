"use server";

import db from "@/lib/mongodb";
import { Errata, ErrataDb } from "@/lib/types/errata";

export async function getErratasByCardId(cardId: string): Promise<Errata[]> {
  const card = await db.collection("cards").findOne({ id: cardId });
  const matchingCardIds = card ? await db.collection('cards').find({ name: card.name }, { projection: { id: 1 } }).toArray() : null;

  const erratasDb = await db
    .collection<ErrataDb>("erratas")
    .find(matchingCardIds ? { cardId: { $in: matchingCardIds.map(i => i.id) } } : { cardId })
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
    deprecatedAt: errata.deprecatedAt,
  }));
}

export async function getAllErratas(): Promise<Errata[]> {
  const erratasDb = await db
    .collection<ErrataDb>("erratas")
    .aggregate([
      {
        $lookup: {
          from: 'cards',
          localField: 'cardId',
          foreignField: 'id',
          as: 'card',
          pipeline: [
            {
              $limit: 1
            },
            {
              $project: {
                _id: 0,
                gameId: 0,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$card',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        }
      }
    ])
    .toArray();

  return erratasDb.map((errata) => ({
    id: errata._id.toString(),
    cardId: errata.cardId,
    card: errata.card,
    type: errata.type,
    details: errata.details,
    source: errata.source,
    errataDate: errata.errataDate,
    createdBy: errata.createdBy.toString(),
    createdAt: errata.createdAt,
    deprecatedAt: errata.deprecatedAt,
  }));
}
