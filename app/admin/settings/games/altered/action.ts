'use server';

import { auth } from '@/lib/auth';
import meilisearch, {indexes} from "@/lib/meilisearch";
import {BoosterCard} from "@/lib/types/booster";
import {headers} from "next/headers";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";

export async function importCards() {
  console.log('Starting Altered card import...');

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  console.info('Importing cards database...');

  const setsResult = await fetch('https://api.altered.gg/card_sets');
  if (!setsResult.ok) {
    console.error('Failed to fetch sets database');
    return;
  }
  const setsRaw = await setsResult.json();
  const sets: { code: string; name: string; reference: string }[] = setsRaw['hydra:member'].map((setRaw: { code: string; name: string; reference: string }) => {
    return {
      code: setRaw.code,
      name: setRaw.name,
      reference: setRaw.reference,
    };
  });
  const setMapByRefence = sets.reduce((acc: { [reference: string]: { code: string; name: string } }, set) => {
    acc[set.reference] = {
      code: set.code,
      name: set.name,
    };
    return acc;
  }, {});

  let page = 1;
  while (true) {
    console.debug(`Fetching page ${page}...`);
    const cardsResult = await fetch(`https://api.altered.gg/cards?page=${page}&locale=fr-fr&itemsPerPage=108`);

    if (!cardsResult.ok) {
      console.error('Failed to fetch cards database');
      return;
    }

    const responseRaw = await cardsResult.json();
    const cardsRaw = responseRaw['hydra:member'];

    const cards: BoosterCard[] = cardsRaw.map((cardRaw: any): BoosterCard => ({
      id: cardRaw.id,
      image: cardRaw.imagePath,
      collectorNumber: cardRaw.collectorNumberFormatted,
      setCode: setMapByRefence[cardRaw.cardSet.reference]?.code ?? cardRaw.cardSet.reference,
      name: cardRaw.name,
    }))

    await meilisearch.index(indexes.altered.name).addDocuments(cards);
    await db.collection<BoosterCard>('cards').insertMany(cards.map(card => ({
      ...card,
      gameId: new ObjectId('690e6100c9c4f79df490911d'),
    })));

    if (!responseRaw['hydra:view']['hydra:next']) {
      break;
    }

    page++;
  }

  console.log('Import completed.');
}
