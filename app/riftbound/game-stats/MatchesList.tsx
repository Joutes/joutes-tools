"use client";

import { useState } from "react";
import { Match } from "@/lib/types/match";
import { deleteMatchAction } from "@/app/riftbound/game-stats/action";
import { Button } from "@/components/ui/button";
import { Trash2, Trophy, Sword, User, CalendarDays } from "lucide-react";

function MatchResultBadge({ wins, losses }: { wins: number; losses: number }) {
  const isWin = wins > losses;
  const isDraw = wins === losses;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
        isWin
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          : isDraw
          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      }`}
    >
      {isWin ? <Trophy className="h-3 w-3" /> : isDraw ? "=" : <Sword className="h-3 w-3" />}
      {wins}–{losses}
    </span>
  );
}

function DeleteMatchButton({ matchId }: { matchId: string }) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce match ?")) return;
    setPending(true);
    try {
      await deleteMatchAction(matchId);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={pending}
      className="text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export default function MatchesList({ matches }: { matches: Match[] }) {
  if (matches.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12">
        Aucun match enregistré. Ajoutez votre premier match !
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        const wins = match.games.filter((g) => g.result === "win").length;
        const losses = match.games.filter((g) => g.result === "loss").length;

        return (
          <div
            key={match.id}
            className="border rounded-lg p-4 bg-card shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Légendes & résultat */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Légende utilisateur */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <img
                    src={match.userLegend.image}
                    alt={match.userLegend.name}
                    className="w-16 h-auto rounded-md shadow"
                  />
                  <span className="text-xs text-center font-medium line-clamp-2 max-w-[70px]">
                    {match.userLegend.name}
                  </span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-2 px-2">
                  <MatchResultBadge wins={wins} losses={losses} />
                  <div className="flex gap-1">
                    {match.games.map((game, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                          game.result === "win"
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                        title={game.result === "win" ? "Victoire" : "Défaite"}
                      >
                        {game.result === "win" ? "V" : "D"}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Légende adversaire */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <img
                    src={match.opponentLegend.image}
                    alt={match.opponentLegend.name}
                    className="w-16 h-auto rounded-md shadow opacity-90"
                  />
                  <span className="text-xs text-center font-medium line-clamp-2 max-w-[70px]">
                    {match.opponentLegend.name}
                  </span>
                </div>

                {/* Infos adversaire + notes */}
                <div className="flex-1 min-w-0">
                  {match.opponentName && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <User className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{match.opponentName}</span>
                    </div>
                  )}
                  {match.notes && (
                    <p className="text-sm text-muted-foreground italic line-clamp-2">
                      {match.notes}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {new Date(match.matchDate).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <DeleteMatchButton matchId={match.id} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

