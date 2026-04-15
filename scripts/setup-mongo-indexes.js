/**
 * Setup MongoDB indexes for joutes-tools.
 * Run once (or after adding new indexes): node scripts/setup-mongo-indexes.js
 */

const { MongoClient } = require("mongodb");

const uri = "";
if (!uri) {
  console.error('Missing MONGODB_URI environment variable');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();

  console.log("📦 Setting up MongoDB indexes...\n");

  // ── policies: text index on title + content ──────────────────────────────
  await db.collection("policies").createIndex(
    { title: "text", content: "text" },
    {
      name: "policies_text_search",
      weights: { title: 10, content: 1 }, // Title matches rank higher
      default_language: "english",
    }
  );
  console.log("✅  policies → text index on (title, content) [weights: title×10, content×1, lang: french]");

  // ── policies: compound index for gameId + createdAt queries ──────────────
  await db.collection("policies").createIndex(
    { gameId: 1, createdAt: -1 },
    { name: "policies_gameId_createdAt" }
  );
  console.log("✅  policies → compound index on (gameId, createdAt)");

  // ── policy-votes: unique index to prevent duplicate votes ────────────────
  await db.collection("policy-votes").createIndex(
    { policyId: 1, userId: 1 },
    { name: "policy_votes_unique", unique: true }
  );
  console.log("✅  policy-votes → unique index on (policyId, userId)");

  console.log("\n🎉 All indexes created successfully.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

