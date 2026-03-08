'use server';

import { auth } from '@/lib/auth';
import meilisearch, {indexes} from "@/lib/meilisearch";
import {BoosterCard} from "@/lib/types/booster";
import {headers} from "next/headers";
import db from "@/lib/mongodb";
import {ObjectId} from "bson";

async function getCardsListFromOfficialWebSite(): Promise<{
  id: string;
  name: string;
  subtitle: string;
  setCode: string;
  lang: string;
  text: string;
  power: number;
  hp: number;
  cost: number;
  type: string;
  traits: string[];
  arenas: string[];
  rarity: string;
  image: string;
  collectorNumber: string;
}[]> {
  const cards = [];

  let page = 1;

  while (true) {
    console.info(`Fetching cards database page ${page}...`);
    const cardsResult = await fetch(`https://admin.starwarsunlimited.com/api/card-list?locale=fr&pagination[page]=${page}&pagination[pageSize]=100`);

    if (!cardsResult.ok) {
      console.error('Failed to fetch cards database');
      console.error(await cardsResult.text());
      throw new Error('Failed to fetch cards database');
    }

    const json = await cardsResult.json();

    cards.push(...json.data);

    if (json.meta.pagination.page >= json.meta.pagination.pageCount || json.data.length === 0) {
      break;
    }

    page++;
  }

  return cards.map(cardRaw => ({
    id: cardRaw.id,
    name: cardRaw.attributes.title,
    subtitle: cardRaw.attributes.subtitle,
    setCode: cardRaw.attributes.expansion.data.attributes.code,
    lang: cardRaw.attributes.locale,
    text: cardRaw.attributes.text,
    power: cardRaw.attributes.power,
    hp: cardRaw.attributes.hp,
    cost: cardRaw.attributes.cost,
    type: cardRaw.attributes.type.data.attributes.value,
    traits: cardRaw.attributes.traits.data.map((trait: any) => trait.attributes.name),
    arenas: cardRaw.attributes.arenas.data.map((arena: any) => arena.attributes.name),
    rarity: cardRaw.attributes.rarity.data.attributes.englishName,
    image: cardRaw.attributes.artFront.data?.attributes.url,
    collectorNumber: cardRaw.attributes.cardNumber,
  }))
}

export async function importCards() {
  console.log('Starting SWU card import...');

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session?.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  const cards = await getCardsListFromOfficialWebSite();

  console.log(`Importing ${cards.length} SWU cards...`);

  const cardsSanitized: BoosterCard[] = cards;

  for (let i = 0; i < cardsSanitized.length; i += 5000) {
    const batch = cardsSanitized.slice(i, i + 5000);
    console.log(`Prepared batch ${i / 5000 + 1} (${batch.length} cards)`);

    await meilisearch.index(indexes.swu.name).addDocuments(batch);
    await db.collection('cards').insertMany(batch.map(card => ({
      ...card,
      gameId: new ObjectId('68f108675fdfb9c53ba3387d'),
    })));
  }

  console.log('Import completed.');
}
