'use server';

import cards from '@/data/riftbound/cards.json';
import meilisearch from "@/lib/meilisearch";
import {BoosterCard} from "@/lib/types/booster";

const sets: { [setName: string]: { code: string } } = {
  'origins': {
    code: 'OGN',
  },
  'origins-proving-grounds': {
    code: 'OGS',
  },
};

export async function importCards() {
  console.log(`Importing ${cards.length} Riftbound cards...`);

  const cardsSanitized: BoosterCard[] = cards.map((card) => {
    return {
      ...card,
      id: card.id.replaceAll('*', '-s-'),
      image: card.images.small,

      collectorNumber: card.number?.split('/')[0] ?? '0',
      setCode: sets[card.set.id]?.code ?? '???',
      lang: 'en',
    };
  });

  for (let i = 0; i < cardsSanitized.length; i += 5000) {
    const batch = cardsSanitized.slice(i, i + 5000);
    console.log(`Prepared batch ${i / 5000 + 1} (${batch.length} cards)`);

    await meilisearch.index('cards-riftbound').addDocuments(batch);
  }

  console.log('Import completed.');
}
