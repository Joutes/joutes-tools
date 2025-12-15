(async () => {
  const meiliEndpoint = 'http://localhost:7700';
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