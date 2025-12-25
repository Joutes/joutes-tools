import db from "@/lib/mongodb";
import {Booster, BoosterCard, BoosterCardDb, BoosterDb} from "@/lib/types/booster";
import {ObjectId} from "bson";

export async function createBooster(booster: Omit<Booster, 'id' | 'createdAt'>): Promise<Booster> {
  const result = await db.collection<BoosterDb>('boosters').insertOne({
    gameId: new ObjectId(booster.gameId),
    userId: new ObjectId(booster.userId),
    setCode: booster.setCode,
    lang: booster.lang,
    type: booster.type,
    price: booster.value,
    archived: booster.archived,
    createdAt: new Date(),
  });

  return {
    ...booster,
    id: result.insertedId.toString(),
    createdAt: new Date().toISOString(),
  };
}

export async function getBoosters({userId, gameId, page = 0, limit = 20, offset = 0,}: {
  userId?: string;
  gameId?: string;
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<Booster[]> {
  const query: {
    gameId?: ObjectId;
    userId?: ObjectId;
  } = {};
  if (gameId) {
    query['gameId'] = new ObjectId(gameId);
  }
  if (userId) {
    query['userId'] = new ObjectId(userId);
  }

  const boosters = await db.collection<BoosterDb>('boosters').aggregate([
    {$match: query},
    {$sort: {createdAt: -1}},
    {$skip: offset * page},
    {$limit: limit},
    {
      $lookup: {
        from: 'booster-cards',
        localField: '_id',
        foreignField: 'boosterId',
        as: 'cards',
        pipeline: [
          {
            $addFields: {
              id: { $toString: '$id' }
            }
          },
          {$project: {_id: 0, boosterId: 0}}
        ],
      },
    },
  ]).toArray();

  return boosters.map((booster) => ({
    gameId: booster.gameId.toString(),
    userId: booster.userId.toString(),
    setCode: booster.setCode,
    lang: booster.lang,
    type: booster.type,
    cards: booster.cards,
    value: booster.price,
    archived: booster.archived,
    createdAt: booster.createdAt.toISOString(),
    id: booster._id.toString(),
    _id: undefined,
  }));
}

export async function getBooster(boosterId: string): Promise<Booster | null> {
  const booster = await db.collection<BoosterDb>('boosters').findOne({
    _id: new ObjectId(boosterId),
  });

  if (!booster) {
    return null;
  }

  const cards = await db.collection<BoosterCardDb>('booster-cards').find({
    boosterId: new ObjectId(boosterId),
  }).toArray();

  return {
    gameId: booster.gameId.toString(),
    userId: booster.userId.toString(),
    setCode: booster.setCode,
    lang: booster.lang,
    type: booster.type,
    cards: cards.map((card) => ({
      ...card,
      id: card._id.toString(),
      boosterId: undefined,
      _id: undefined,
    })),
    value: booster.price,
    archived: booster.archived,
    createdAt: booster.createdAt.toISOString(),
    id: booster._id.toString(),
  };
}

export async function addCardToBooster(boosterId: string, card: Omit<BoosterCard, 'id'>): Promise<void> {
  const booster = await db.collection<BoosterDb>('boosters').findOne({
    _id: new ObjectId(boosterId),
  }, {projection: {_id: 1}});
  if (!booster) {
    throw new Error('Booster not found');
  }

  await db.collection<BoosterCardDb>('booster-cards').insertOne({
    ...card,
    boosterId: booster._id,
  });
}

export async function removeCardFromBooster(boosterId: string, cardId: string): Promise<void> {
  console.log('Removing card', cardId, 'from booster', boosterId);
  const booster = await db.collection<BoosterDb>('boosters').findOne({
    _id: new ObjectId(boosterId),
  }, {projection: {_id: 1}});
  if (!booster) {
    throw new Error('Booster not found');
  }

  await db.collection<BoosterCardDb>('booster-cards').deleteOne({
    boosterId: booster._id,
    _id: new ObjectId(cardId),
  });
}
