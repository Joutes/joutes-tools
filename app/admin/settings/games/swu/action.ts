'use server';

import cards from '@/data/riftbound/cards-tcg-arena.json';
import { auth } from '@/lib/auth';
import meilisearch, {indexes} from "@/lib/meilisearch";
import {BoosterCard} from "@/lib/types/booster";
import {headers} from "next/headers";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";

const sets: {
  [setName: string]: {
    code: string;
    maxCollectorNumber?: number
    idPrefix?: string;
  }
} = {
  '01 - Origins': {
    code: 'OGN',
    maxCollectorNumber: 298,
    idPrefix: 'origins-',
  },
  '00 - Proving Grounds': {
    code: 'OGS',
    maxCollectorNumber: 24,
    idPrefix: 'ogs',
  },
  '02 - Spiritforged': {
    code: 'SFD',
  },
};

export async function importCards() {
  console.log('Starting Riftbound card import...');

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  const cardsArray: {
    id: string;
    face: {
      front: {
        name: string;
        type: string;
        cost: number;
        image: string;
      };
    };
    name: string;
    type: string;
    cost: number;
    Set?: string[];
  }[] = Object.values(cards);

  console.log(`Importing ${cardsArray.length} Riftbound cards...`);

  const cardsSanitized: BoosterCard[] = cardsArray.map((card) => {
    const [cardSetCode, cardNumber] = card.id.split('-');
    const cardSet = card.Set?.[0];

    let cardId = "";
    if (cardSet) {
      const setInfo = sets[cardSet];
      cardId = `${setInfo?.idPrefix ?? setInfo.code}${cardNumber}${setInfo?.maxCollectorNumber ?? ''}`;
    } else {
      cardId = card.id;
    }

    return {
      ...card,
      id: cardId,
      image: card.face.front.image,

      collectorNumber: cardNumber,
      setCode: cardSetCode ?? '???',
      lang: 'en',
    };
  });

  for (let i = 0; i < cardsSanitized.length; i += 5000) {
    const batch = cardsSanitized.slice(i, i + 5000);
    console.log(`Prepared batch ${i / 5000 + 1} (${batch.length} cards)`);

    await meilisearch.index(indexes.riftbound.name).addDocuments(batch);
    await db.collection('cards').insertMany(batch.map(card => ({
      ...card,
      gameId: new ObjectId('69009afea722eab4fa0e55c4'),
    })));
  }

  console.log('Import completed.');
}
