import {MeiliSearch} from "meilisearch";

(async () => {
  const indexName = 'swu-cards';
  const meiliEndpoint = 'http://localhost:7700';
  const apiKey = undefined;
  const client = new MeiliSearch({
    host: meiliEndpoint,
    apiKey,
  });

  // Delete the index if it already exists
  try {
    //await client.index(indexName).delete();
    //console.info('Existing index deleted');
  } catch (e) {
    console.info('Index does not exist, no need to delete');
  }

  await fetch(`${meiliEndpoint}/indexes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      "uid": indexName,
      "primaryKey": "id"
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to create index');
    }
  });

  await fetch(`${meiliEndpoint}/indexes/${indexName}/settings`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      "searchableAttributes": [
        "name",
        "subtitle",
        "text",
      ],
      "filterableAttributes": ["name", "subtitle", "lang", "setCode", "collectorNumber"],
      "sortableAttributes": ["setCode", "collectorNumber"],
    }),
  }).then(async (response) => {
    if (!response.ok) {
      console.log(await response.text());
      throw new Error('Failed to setup index');
    }
  });

})();