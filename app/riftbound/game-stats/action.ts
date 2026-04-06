"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Match, MatchGame } from "@/lib/types/match";
import { createMatch, deleteMatch, updateMatch } from "@/lib/data/matches";

export async function createMatchAction(data: {
  userLegend: Match["userLegend"];
  opponentName?: string;
  opponentLegend: Match["opponentLegend"];
  games: MatchGame[];
  notes?: string;
  matchDate: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  await createMatch({
    userId: session.user.id,
    userLegend: data.userLegend,
    opponentName: data.opponentName,
    opponentLegend: data.opponentLegend,
    games: data.games,
    notes: data.notes,
    matchDate: data.matchDate,
  });

  revalidatePath("/riftbound/game-stats");
  revalidatePath("/riftbound/game-stats/statistics");
}

export async function deleteMatchAction(matchId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  await deleteMatch(matchId, session.user.id);

  revalidatePath("/riftbound/game-stats");
  revalidatePath("/riftbound/game-stats/statistics");
}

export async function updateMatchAction(
  matchId: string,
  data: {
    userLegend: Match["userLegend"];
    opponentName?: string;
    opponentLegend: Match["opponentLegend"];
    games: MatchGame[];
    notes?: string;
    matchDate: string;
  }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Utilisateur non authentifié");
  }

  await updateMatch(matchId, session.user.id, {
    userLegend: data.userLegend,
    opponentName: data.opponentName,
    opponentLegend: data.opponentLegend,
    games: data.games,
    notes: data.notes,
    matchDate: data.matchDate,
  });

  revalidatePath("/riftbound/game-stats");
  revalidatePath("/riftbound/game-stats/statistics");
}

