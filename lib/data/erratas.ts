"use server";

import db from "@/lib/mongodb";
import { Errata, ErrataDb } from "@/lib/types/errata";

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
  }));
}
