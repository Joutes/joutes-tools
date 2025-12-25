import {MongoClient} from "mongodb";

const uri = "";

async function up() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  const booster = db.collection('boosters').find();

  for (let doc = await booster.next(); doc != null; doc = await booster.next()) {
    if (!doc.cards || !Array.isArray(doc.cards)) {
      continue;
    }

    const cards = doc.cards;

    if (cards.length === 0) {
      continue;
    }

    await db.collection('booster-cards').insertMany(cards.map((card: any) => ({
      boosterId: doc._id,
      ...card
    })));

    await db.collection('boosters').updateOne({_id: doc._id}, {$unset: {cards: ""}});
  }

  await client.close();
}

up();