import db from "@/lib/mongodb";
import { Match, MatchDb } from "@/lib/types/match";
import { ObjectId } from "bson";

export async function getMatches(userId: string): Promise<Match[]> {
  const matches = await db
    .collection<MatchDb>("stats-matches")
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  return matches.map((match) => ({
    id: (match as any)._id.toString(),
    userId: match.userId.toString(),
    userLegend: match.userLegend,
    opponentName: match.opponentName,
    opponentLegend: match.opponentLegend,
    games: match.games,
    notes: match.notes,
    createdAt: match.createdAt.toISOString(),
  }));
}

export async function createMatch(
  match: Omit<Match, "id" | "createdAt">
): Promise<Match> {
  const result = await db.collection<MatchDb>("stats-matches").insertOne({
    userId: new ObjectId(match.userId),
    userLegend: match.userLegend,
    opponentName: match.opponentName,
    opponentLegend: match.opponentLegend,
    games: match.games,
    notes: match.notes,
    createdAt: new Date(),
  });

  return {
    ...match,
    id: result.insertedId.toString(),
    createdAt: new Date().toISOString(),
  };
}

export async function deleteMatch(
  matchId: string,
  userId: string
): Promise<void> {
  await db.collection<MatchDb>("stats-matches").deleteOne({
    _id: new ObjectId(matchId),
    userId: new ObjectId(userId),
  });
}

