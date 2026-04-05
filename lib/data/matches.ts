import db from "@/lib/mongodb";
import { Match, MatchDb, LegendStats } from "@/lib/types/match";
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

export function computeLegendStats(matches: Match[]): LegendStats[] {
  const legendMap = new Map<
    string,
    {
      legend: Match["userLegend"];
      matchWins: number;
      matchLosses: number;
      matchDraws: number;
      gamesWon: number;
      gamesLost: number;
      matchups: Map<
        string,
        { legend: Match["opponentLegend"]; wins: number; losses: number; draws: number }
      >;
    }
  >();

  for (const match of matches) {
    const key = match.userLegend.cardId;
    if (!legendMap.has(key)) {
      legendMap.set(key, {
        legend: match.userLegend,
        matchWins: 0,
        matchLosses: 0,
        matchDraws: 0,
        gamesWon: 0,
        gamesLost: 0,
        matchups: new Map(),
      });
    }

    const stats = legendMap.get(key)!;
    const wins = match.games.filter((g) => g.result === "win").length;
    const losses = match.games.filter((g) => g.result === "loss").length;

    stats.gamesWon += wins;
    stats.gamesLost += losses;

    if (wins > losses) stats.matchWins++;
    else if (losses > wins) stats.matchLosses++;
    else stats.matchDraws++;

    const opponentKey = match.opponentLegend.cardId;
    if (!stats.matchups.has(opponentKey)) {
      stats.matchups.set(opponentKey, {
        legend: match.opponentLegend,
        wins: 0,
        losses: 0,
        draws: 0,
      });
    }
    const matchup = stats.matchups.get(opponentKey)!;
    if (wins > losses) matchup.wins++;
    else if (losses > wins) matchup.losses++;
    else matchup.draws++;
  }

  return Array.from(legendMap.values())
    .map((s) => {
      const total = s.matchWins + s.matchLosses + s.matchDraws;
      return {
        legend: s.legend,
        matchesPlayed: total,
        matchWins: s.matchWins,
        matchLosses: s.matchLosses,
        matchDraws: s.matchDraws,
        gamesWon: s.gamesWon,
        gamesLost: s.gamesLost,
        winRate: total > 0 ? Math.round((s.matchWins / total) * 100) : 0,
        matchups: Array.from(s.matchups.values())
          .map((m) => ({
            legend: m.legend,
            matchesPlayed: m.wins + m.losses + m.draws,
            wins: m.wins,
            losses: m.losses,
            draws: m.draws,
          }))
          .sort((a, b) => b.matchesPlayed - a.matchesPlayed),
      };
    })
    .sort((a, b) => b.matchesPlayed - a.matchesPlayed);
}

