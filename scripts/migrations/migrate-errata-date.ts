/**
 * Migration script to add errataDate field to existing erratas
 * 
 * This script:
 * - Adds errataDate field to all erratas that don't have it
 * - Sets errataDate to createdAt for existing erratas
 * 
 * Run with: npx tsx scripts/migrations/migrate-errata-date.ts
 */

import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mtg-tools";

async function migrateErrataDate() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const erratasCollection = db.collection("erratas");

    // Find erratas without errataDate
    const erratasWithoutDate = await erratasCollection.find({
      errataDate: { $exists: false },
    }).toArray();

    console.log(`📊 Found ${erratasWithoutDate.length} erratas without errataDate`);

    if (erratasWithoutDate.length === 0) {
      console.log("✨ No migration needed");
      return;
    }

    // Update each errata to set errataDate = createdAt
    let updated = 0;
    for (const errata of erratasWithoutDate) {
      await erratasCollection.updateOne(
        { _id: errata._id },
        {
          $set: {
            errataDate: errata.createdAt || new Date(),
          },
        }
      );
      updated++;
    }

    console.log(`✅ Updated ${updated} erratas with errataDate`);
    console.log("✨ Migration complete!");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await client.close();
    console.log("🔌 Disconnected from MongoDB");
  }
}

migrateErrataDate();
