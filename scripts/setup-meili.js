import {MeiliSearch} from "meilisearch";

(async () => {
  const meiliEndpoint = 'http://localhost:7700';
  const client = new MeiliSearch({ host: meiliEndpoint });

  // Delete the index if it already exists
  try {
    await client.index('cards-riftbound').delete();
    console.info('Existing index deleted');
  } catch (e) {
    console.info('Index does not exist, no need to delete');
  }

  await fetch(`${meiliEndpoint}/indexes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "uid": "cards-riftbound",
      "primaryKey": "id"
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to create index');
    }
  });

  await fetch(`${meiliEndpoint}/indexes/cards-riftbound/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "searchableAttributes": [
        "name",
        "text",
      ],
      "filterableAttributes": ["name", "lang", "setCode", "collectorNumber"],
      "sortableAttributes": ["setCode", "collectorNumber"],
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to setup index');
    }
  });

})();