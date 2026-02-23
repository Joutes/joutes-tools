'use server';

import { auth } from '@/lib/auth';
import meilisearch, {indexes} from "@/lib/meilisearch";
import {BoosterCard} from "@/lib/types/booster";
import {headers} from "next/headers";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";

const sets = {
  'Core set': {
    code: "CORE",
  },
};

export async function importCards() {
  console.log('Starting Drakerion card import...');

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  console.info('Importing cards database...');

  const cardsResult = await fetch('https://www.drakerion.cards/api/cards');
  const citiesResult = await fetch('https://www.drakerion.cards/api/cities');
  const bannersResult = await fetch('https://www.drakerion.cards/api/banners');
  const maneuversResult = await fetch('https://www.drakerion.cards/api/maneuvers?kingdoms=Lokmar%2CTyraslin%2CKartej%2CWasteland%2CGil+Estel%2CNeutral');

  if (!cardsResult.ok || !citiesResult.ok || !bannersResult.ok || !maneuversResult.ok) {
    console.error('Failed to fetch cards database');
    return;
  }

  const cardsRaw = await cardsResult.json();
  const citiesRaw = await citiesResult.json();
  const bannersRaw = await bannersResult.json();
  const maneuversRaw = await maneuversResult.json();

  const allRaw = [...cardsRaw, ...citiesRaw, ...bannersRaw, ...maneuversRaw];

  console.info(`Fetched ${cardsRaw.length} cards, ${citiesRaw.length} cities, ${bannersRaw.length} banners and ${maneuversRaw.length} maneuvers, total ${allRaw.length} items.`);


  const cards: BoosterCard[] = allRaw.map(cardRaw => ({
    id: cardRaw.id,
    image: `https://www.drakerion.cards${cardRaw.imagePath}`,
    lang: 'fr',
    setCode: 'CORE',
    collectorNumber: cardRaw.id,
    name: cardRaw.name,
    type: cardRaw.type,
    kingdomId: cardRaw.kingdomId,
    subtitle: cardRaw.subtitle,
    traits: cardRaw.traits,
  }));

  for (let i = 0; i < cards.length; i += 5000) {
    const batch = cards.slice(i, i + 5000);
    console.log(`Prepared batch ${i / 5000 + 1} (${batch.length} cards)`);

    await meilisearch.index(indexes.drakerion.name).addDocuments(batch);
    await db.collection<BoosterCard>('cards').insertMany(batch.map(card => ({
      ...card,
      gameId: new ObjectId('690f126e31b979d229913bf7'),
    })));
  }

  console.log('Import completed.');
}
