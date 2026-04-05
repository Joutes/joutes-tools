'use server';

import db from '@/lib/mongodb';
import {Errata} from "@/lib/types/errata";

export type DeckListCard = {
  name: string;
  quantity: number;
  cardId?: string;
  image?: string;
  banned?: boolean;
  recognized?: boolean;
  erratas?: Errata[];
};

export type DeckList = {
  champions: DeckListCard[];
  legends: DeckListCard[];
  maindeck: DeckListCard[];
  sideboard: DeckListCard[];
  battlefields: DeckListCard[];
  runes: DeckListCard[];
};

export async function validateDeckList(decklist: DeckList): Promise<DeckList> {
  const allSections = Object.keys(decklist) as (keyof DeckList)[];

  type CardWithSection = DeckListCard & { section: keyof DeckList };
  const allCards: CardWithSection[] = allSections.flatMap((section) =>
    decklist[section].map((card) => ({...card, section}))
  );

  // Collect unique card names to fetch in a single MongoDB query
  const uniqueNames = [...new Set(allCards.map((c) => c.name))];

  const cardsFromDb =
    uniqueNames.length > 0
      ? await db
        .collection<{ id: string; name: string; image?: string; banned?: boolean; erratas?: Errata[] }>('cards')
        .aggregate([
          {
            $match: {name: {$in: uniqueNames}, lang: 'en'},
          },
          {
            $lookup: {
              from: 'erratas',
              localField: 'id',
              foreignField: 'cardId',
              as: 'erratas',
              pipeline: [
                {
                  $addFields: {
                    id: {$toString: '$_id'},
                  },
                },
                {
                  $project: {
                    _id: 0,
                    createdBy: 0,
                  },
                },
              ],
            },
          },
          {
            $project: {
              id: 1,
              name: 1,
              image: 1,
              banned: 1,
              erratas: 1,
            },
          },
        ], {collation: {locale: 'en', strength: 2}})
        .toArray()
      : [];

  // Map by lowercase card name for case-insensitive O(1) lookup
  const cardMap = new Map(cardsFromDb.map((c) => [c.name.toLowerCase(), c]));

  // Rebuild DeckList with enriched data
  const result: DeckList = {
    champions: [],
    legends: [],
    maindeck: [],
    sideboard: [],
    battlefields: [],
    runes: [],
  };

  for (const card of allCards) {
    const cardDb = cardMap.get(card.name.toLowerCase());
    result[card.section].push({
      name: card.name,
      quantity: card.quantity,
      cardId: cardDb?.id,
      image: cardDb?.image,
      banned: cardDb?.banned ?? false,
      recognized: !!cardDb,
      erratas: cardDb?.erratas ?? [],
    });
  }

  return result;
}

