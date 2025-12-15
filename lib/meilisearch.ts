import {Meilisearch} from "meilisearch";

const meilisearch = new Meilisearch({
  host: 'localhost:7700',
});

export default meilisearch;
