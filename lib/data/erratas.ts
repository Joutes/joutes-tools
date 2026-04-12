"use server";

import db from "@/lib/mongodb";
import { Errata, ErrataDb } from "@/lib/types/errata";
import { ObjectId } from "bson";

export async function getErratasByCardId(cardId: string, userId?: string): Promise<Errata[]> {
  const card = await db.collection("cards").findOne({ id: cardId });
  const matchingCardIds = card
    ? await db.collection('cards').find({ name: card.name }, { projection: { id: 1 } }).toArray()
    : null;

  const matchFilter = matchingCardIds
    ? { cardId: { $in: matchingCardIds.map((i) => i.id) } }
    : { cardId };

  const erratasDb = await db
    .collection<ErrataDb>("erratas")
    .aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'errata-votes',
          localField: '_id',
          foreignField: 'errataId',
          as: 'votesList',
        },
      },
      { $sort: { createdAt: -1 } },
    ])
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
    votes: {
      positive: (errata.votesList ?? []).filter((v: { vote: string }) => v.vote === 'positive').length,
      negative: (errata.votesList ?? []).filter((v: { vote: string }) => v.vote === 'negative').length,
      userVote: userId
        ? (errata.votesList ?? []).find((v: { userId: ObjectId; vote: string }) => v.userId.toString() === userId)?.vote
        : undefined,
    },
  }));
}

export async function getAllErratas(userId?: string): Promise<Errata[]> {
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
            { $limit: 1 },
            { $project: { _id: 0, gameId: 0 } },
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
        $lookup: {
          from: 'errata-votes',
          localField: '_id',
          foreignField: 'errataId',
          as: 'votesList',
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
    votes: {
      positive: (errata.votesList ?? []).filter((v: { vote: string }) => v.vote === 'positive').length,
      negative: (errata.votesList ?? []).filter((v: { vote: string }) => v.vote === 'negative').length,
      userVote: userId
        ? (errata.votesList ?? []).find((v: { userId: ObjectId; vote: string }) => v.userId.toString() === userId)?.vote
        : undefined,
    },
  }));
}
