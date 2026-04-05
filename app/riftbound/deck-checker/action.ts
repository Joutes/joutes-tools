'use server';

import db from '@/lib/mongodb';
import {Errata} from "@/lib/types/errata";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";
import {generateText} from "ai";
import {openai} from "@ai-sdk/openai";

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
  const cardMap = new Map(cardsFromDb.sort((a, b) => a.erratas.length - b.erratas.length).map((c) => [c.name.toLowerCase(), c]));

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

function parseCardList(text: string): string[] {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      // Retirer les numéros de ligne ou puces
      .map((line) => line.replace(/^[\d\-•*]+[\.\):\s]*/, "").trim())
      .filter((line) => line.length > 0)
  );
}

function normalizeCardName(cardName: string): string {
  // Retirer les quantités (2x, x2, etc.)
  let normalized = cardName.replace(/^\d+x\s*/i, "").replace(/\s*x\d+$/i, "");
  // Retirer la ponctuation et mettre en minuscule
  normalized = normalized
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

export async function analyzeDeckListImage(imageBase64: string): Promise<{ raw: string; deckList: DeckList }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  // Extraire les cartes de la photo avec OpenAI Vision
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all card names from this Star Wars Unlimited deck photo. Return ONLY a list of card names, one per line, without any additional text, formatting, or numbering. If the card is in the photo multiple times, list it multiple times, one per line.",
          },
          {
            type: "image",
            image: imageBase64,
          },
        ],
      },
    ],
  });

  // Parser les listes
  const extractedCards = parseCardList(text);

  console.log(extractedCards);

  return {
    raw: text,
    deckList: {
      champions: [],
      legends: [],
      runes: [],
      battlefields: [],
      maindeck: [],
      sideboard: [],
    },
  };
}
