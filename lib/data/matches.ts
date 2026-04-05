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
    matchDate: match.matchDate.toISOString(),
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
    matchDate: new Date(match.matchDate),
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

/**
 * Calcule les stats par légende sur l'ensemble des matchs en base (tous utilisateurs).
 * Le calcul est entièrement délégué à MongoDB via un pipeline d'agrégation :
 *   1. Ajout de champs calculés par match (gamesWon, gamesLost, isMatchWin, isMatchLoss)
 *   2. Regroupement par (userLegend × opponentLegend) → stats de matchup
 *   3. Regroupement par userLegend seul → stats globales + tableau de matchups
 *   4. Calcul winRate + tri des matchups en base via $sortArray
 * Le résultat est upsert dans la collection "cache".
 */
export async function computeAllLegendStats(): Promise<LegendStats[]> {
  const pipeline = [
    // ── Étape 1 : champs calculés par match ────────────────────────────────
    {
      $addFields: {
        gamesWon: {
          $size: {
            $filter: {
              input: "$games",
              as: "g",
              cond: { $eq: ["$$g.result", "win"] },
            },
          },
        },
        gamesLost: {
          $size: {
            $filter: {
              input: "$games",
              as: "g",
              cond: { $eq: ["$$g.result", "loss"] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        isMatchWin: { $gt: ["$gamesWon", "$gamesLost"] },
        isMatchLoss: { $gt: ["$gamesLost", "$gamesWon"] },
      },
    },
    // ── Étape 2 : regroupement (userLegend × opponentLegend) ───────────────
    // Permet de calculer les matchups et de sommer gamesWon/gamesLost
    // sans avoir à les re-propager après le second $group.
    {
      $group: {
        _id: {
          userCardId: "$userLegend.cardId",
          opponentCardId: "$opponentLegend.cardId",
        },
        userLegend: { $first: "$userLegend" },
        opponentLegend: { $first: "$opponentLegend" },
        matchupWins: { $sum: { $cond: ["$isMatchWin", 1, 0] } },
        matchupLosses: { $sum: { $cond: ["$isMatchLoss", 1, 0] } },
        matchupDraws: {
          $sum: {
            $cond: [
              { $and: [{ $not: ["$isMatchWin"] }, { $not: ["$isMatchLoss"] }] },
              1,
              0,
            ],
          },
        },
        gamesWon: { $sum: "$gamesWon" },
        gamesLost: { $sum: "$gamesLost" },
      },
    },
    // ── Étape 3 : regroupement par userLegend ─────────────────────────────
    // Agrège les totaux et construit le tableau de matchups en une passe.
    {
      $group: {
        _id: "$_id.userCardId",
        legend: { $first: "$userLegend" },
        matchWins: { $sum: "$matchupWins" },
        matchLosses: { $sum: "$matchupLosses" },
        matchDraws: { $sum: "$matchupDraws" },
        gamesWon: { $sum: "$gamesWon" },
        gamesLost: { $sum: "$gamesLost" },
        matchups: {
          $push: {
            legend: "$opponentLegend",
            matchesPlayed: {
              $add: ["$matchupWins", "$matchupLosses", "$matchupDraws"],
            },
            wins: "$matchupWins",
            losses: "$matchupLosses",
            draws: "$matchupDraws",
          },
        },
      },
    },
    // ── Étape 4 : champs dérivés finaux ────────────────────────────────────
    {
      $addFields: {
        matchesPlayed: { $add: ["$matchWins", "$matchLosses", "$matchDraws"] },
      },
    },
    {
      $addFields: {
        winRate: {
          $cond: {
            if: { $gt: ["$matchesPlayed", 0] },
            then: {
              $round: [
                { $multiply: [{ $divide: ["$matchWins", "$matchesPlayed"] }, 100] },
                0,
              ],
            },
            else: 0,
          },
        },
        // Tri des matchups par nombre de matchs joués (desc) directement en base
        matchups: {
          $sortArray: { input: "$matchups", sortBy: { matchesPlayed: -1 } },
        },
      },
    },
    { $sort: { matchesPlayed: -1 } },
    {
      $project: {
        _id: 0,
        legend: 1,
        matchesPlayed: 1,
        matchWins: 1,
        matchLosses: 1,
        matchDraws: 1,
        gamesWon: 1,
        gamesLost: 1,
        winRate: 1,
        matchups: 1,
      },
    },
  ];

  const result = await db
    .collection<MatchDb>("stats-matches")
    .aggregate<LegendStats>(pipeline)
    .toArray();

  // Upsert dans la collection "cache"
  await db.collection("cache").updateOne(
    { name: "riftbound-all-legends-stats" },
    {
      $set: {
        name: "riftbound-all-legends-stats",
        value: result,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  return result;
}

/** Récupère les stats en cache sans recalculer. Retourne null si absentes. */
export async function getCachedAllLegendStats(): Promise<LegendStats[] | null> {
  const cached = await db
    .collection("cache")
    .findOne({ name: "riftbound-all-legends-stats" });
  return cached ? (cached.value as LegendStats[]) : null;
}
