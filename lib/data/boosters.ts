import db from "@/lib/mongodb";
import {Booster, BoosterDb} from "@/lib/types/booster";
import {ObjectId} from "bson";

export async function createBooster(booster: Omit<Booster, 'id' | 'createdAt'>): Promise<Booster> {
  const result = await db.collection<BoosterDb>('boosters').insertOne({
    gameId: new ObjectId(booster.gameId),
    userId: new ObjectId(booster.userId),
    setCode: booster.setCode,
    lang: booster.lang,
    type: booster.type,
    cards: booster.cards,
    price: booster.price,
    archived: booster.archived,
    createdAt: new Date(),
  });

  return {
    ...booster,
    id: result.insertedId.toString(),
    createdAt: new Date().toISOString(),
  };
}

export async function getBoosters({gameId, page = 0, limit = 20, offset = 0,}: {
  gameId?: string;
  page?: number;
  limit?: number;
  offset?: number;
}): Promise<Booster[]> {
  const query: {
    gameId?: ObjectId;
  } = {};
  if (gameId) {
    query['gameId'] = new ObjectId(gameId);
  }

  const boosters = await db.collection<BoosterDb>('boosters').find(query).skip(offset * page).limit(limit).toArray();

  return boosters.map((booster) => ({
    gameId: booster.gameId.toString(),
    userId: booster.userId.toString(),
    setCode: booster.setCode,
    lang: booster.lang,
    type: booster.type,
    cards: booster.cards,
    price: booster.price,
    archived: booster.archived,
    createdAt: booster.createdAt.toISOString(),
    id: booster._id.toString(),
    _id: null,
  }));
}