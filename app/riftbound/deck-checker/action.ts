'use server';

import meilisearch, {indexes} from '@/lib/meilisearch';
import db from '@/lib/mongodb';
import {BoosterCard} from '@/lib/types/booster';
import {Errata} from "@/lib/types/errata";
import {DateTime} from "luxon";

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
  const index = meilisearch.index<BoosterCard & { [key: string]: unknown }>(indexes.riftbound.name);

  const allSections = Object.keys(decklist) as (keyof DeckList)[];

  type CardWithSection = DeckListCard & { section: keyof DeckList };
  const allCards: CardWithSection[] = allSections.flatMap((section) =>
    decklist[section].map((card) => ({...card, section}))
  );

  // Search each card in Meilisearch in parallel
  const searchResults = await Promise.all(
    allCards.map(async (card) => {
      try {
        const result = await index.search(card.name, {
          filter: ['lang IN [en]'],
          limit: 1,
        });

        if (result.hits.length > 0) {
          const hit = result.hits[0];
          return {
            ...card,
            cardId: hit.id as string,
            image: (hit.image as string) || '',
            recognized: true,
          };
        }
      } catch {
        // silently fail per card
      }

      return {...card, recognized: false as const};
    })
  );

  // Batch fetch banned status from MongoDB
  const foundCardIds = searchResults
    .filter((c) => c.recognized && c.cardId)
    .map((c) => c.cardId as string);

  const cardsFromDb =
    foundCardIds.length > 0
      ? await db
        .collection<{ id: string; banned?: boolean }>('cards')
        .aggregate([
          {
            $match: {id: {$in: foundCardIds}}
          },
          {
            $lookup: {
              from: "erratas",
              localField: "id",
              foreignField: "cardId",
              as: "erratas",
              pipeline: [
                {
                  $addFields: {
                    id: {
                      $toString: '$_id'
                    }
                  },
                },
                {
                  $project: {
                    _id: 0,
                    createdBy: 0,
                  }
                },
              ],
            },
          },
          {
            $project: {
              id: 1,
              banned: 1,
              erratas: 1,
            }
          }
        ])
        .toArray()
      : [];

  const cardMap = new Map(cardsFromDb.map((c) => [c.id, c]));

  // Rebuild DeckList with enriched data
  const result: DeckList = {
    champions: [],
    legends: [],
    maindeck: [],
    sideboard: [],
    battlefields: [],
    runes: [],
  };

  for (const card of searchResults) {
    const cardDb = cardMap.get(card.cardId);
    result[card.section].push({
      name: card.name,
      quantity: card.quantity,
      cardId: card.cardId,
      image: card.image,
      banned: cardDb?.banned ?? false,
      recognized: card.recognized,
      erratas: cardDb?.erratas ?? [],
    });
  }

  return result;
}

