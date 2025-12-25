import {Meilisearch} from "meilisearch";

const meilisearch = new Meilisearch({
  host: process.env.MEILISEARCH_ENDPOINT ?? 'localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY ?? undefined,
});

export default meilisearch;

export const indexes = {
  riftbound: 'riftbound-cards',
};
