
'use server';

import cards from '@/data/riftbound/cards-tcg-arena.json';
import { auth } from '@/lib/auth';
import meilisearch, {indexes} from "@/lib/meilisearch";
import {BoosterCard} from "@/lib/types/booster";
import {headers} from "next/headers";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";
import {DateTime} from "luxon";

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
  '03 - Unleashed': {
    code: 'UNL',
  },
  '04 - Vendetta': {
    code: 'VEN',
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
        image: { en: string };
      };
    };
    name: string;
    type: string;
    cost: number;
    Set?: string[];
  }[] = Object.values(cards); //https://russeus.github.io/RB-TCG-Arena/Riftbound-CardList.json

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
      image: card.face.front.image.en,

      collectorNumber: cardNumber,
      setCode: cardSetCode ?? '???',
      lang: 'en',
    };
  });

  const existingCardsIds = await db.collection('cards').find({
    gameId: new ObjectId('69009afea722eab4fa0e55c4'),
  }, { projection: { id: 1 } }).toArray();
  console.log(existingCardsIds.length);


  const newCardsToAdd = cardsSanitized.filter(card => !existingCardsIds.some(existingCard => existingCard.id === card.id));
  console.log(`Found ${newCardsToAdd.length} new cards to add.`);

  for (let i = 0; i < newCardsToAdd.length; i += 5000) {
    const batch = newCardsToAdd.slice(i, i + 5000);
    console.log(`Prepared batch ${i / 5000 + 1} (${batch.length} cards)`);

    await meilisearch.index(indexes.riftbound.name).addDocuments(batch, { primaryKey: 'id' });

    await db.collection('cards').insertMany(batch.map(card => ({
      ...card,
      gameId: new ObjectId('69009afea722eab4fa0e55c4'),
      addedAt: DateTime.utc(),
    })));
  }

  console.log('Import completed.');
}
