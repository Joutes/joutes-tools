'use server';

import cards from '@/data/riftbound/cards.json';
import meilisearch from "@/lib/meilisearch";

const sets = {
  'origins': {
    code: 'OGN',
  },
  'origins-proving-grounds': {
    code: 'OGS',
  },
};

export async function importCards() {
  console.log(`Importing ${cards.length} Riftbound cards...`);

  // push cards to meilisearch

  const cardsSanitized = cards.map((card) => {
    return {
      ...card,
      id: card.id,
      image: card.images.small,

      collectorNumber: parseInt(card.number?.split('/')[0] ?? '0'),
      setCode: sets[card.set.id]?.code ?? '???',
      lang: 'en',
    };
  });

  const tasks =  meilisearch.index('cards-riftbound').addDocumentsInBatches(cardsSanitized, 100);

  await Promise.all(tasks);

  console.log('Import completed.');
}