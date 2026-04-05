"use client";

import { useState } from "react";
import { LegendStats } from "@/lib/types/match";
import { Button } from "@/components/ui/button";
import { Trophy, Sword, BarChart3, ChevronDown, ChevronUp } from "lucide-react";

type SortKey = "played" | "winRate" | "wins";

function WinRateBar({ rate }: { rate: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all ${
          rate >= 60
            ? "bg-green-500"
            : rate >= 40
            ? "bg-yellow-500"
            : "bg-red-500"
        }`}
        style={{ width: `${rate}%` }}
      />
    </div>
  );
}

function MatchupRow({
  wins,
  losses,
  draws,
  matchesPlayed,
  legend,
}: LegendStats["matchups"][number]) {
  const rate = matchesPlayed > 0 ? Math.round((wins / matchesPlayed) * 100) : 0;
  return (
    <div className="flex items-center gap-3 py-1.5 border-t first:border-t-0">
      <img
        src={legend.image}
        alt={legend.name}
        className="w-8 h-auto rounded shrink-0 opacity-90"
      />
      <span className="flex-1 text-sm truncate">{legend.name}</span>
      <span className="text-xs tabular-nums text-green-600 font-semibold">{wins}V</span>
      <span className="text-xs tabular-nums text-red-500 font-semibold">{losses}D</span>
      {draws > 0 && (
        <span className="text-xs tabular-nums text-yellow-600 font-semibold">{draws}N</span>
      )}
      <span className="text-xs text-muted-foreground w-10 text-right">{rate}%</span>
    </div>
  );
}

function LegendCard({ stats }: { stats: LegendStats }) {
  const [showMatchups, setShowMatchups] = useState(false);

  return (
    <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-4 flex gap-4">
        {/* Image */}
        <img
          src={stats.legend.image}
          alt={stats.legend.name}
          className="w-20 h-auto rounded-lg shadow shrink-0 self-start"
        />

        {/* Contenu principal */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Nom + badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base leading-tight">{stats.legend.name}</h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {stats.matchesPlayed} match{stats.matchesPlayed > 1 ? "s" : ""}
            </span>
          </div>

          {/* Taux de victoire */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Taux de victoire</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  stats.winRate >= 60
                    ? "text-green-600"
                    : stats.winRate >= 40
                    ? "text-yellow-600"
                    : "text-red-500"
                }`}
              >
                {stats.winRate}%
              </span>
            </div>
            <WinRateBar rate={stats.winRate} />
          </div>

          {/* Record matchs */}
          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <Trophy className="h-3 w-3" />
              {stats.matchWins}V
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <Sword className="h-3 w-3" />
              {stats.matchLosses}D
            </span>
            {stats.matchDraws > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                ={stats.matchDraws}N
              </span>
            )}
            <span className="text-xs text-muted-foreground self-center">
              · {stats.gamesWon}p. gagnées / {stats.gamesLost}p. perdues
            </span>
          </div>
        </div>
      </div>

      {/* Matchups */}
      {stats.matchups.length > 0 && (
        <div className="border-t">
          <button
            onClick={() => setShowMatchups((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Matchups ({stats.matchups.length})</span>
            {showMatchups ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
          {showMatchups && (
            <div className="px-4 pb-3 space-y-0">
              {stats.matchups.map((mu) => (
                <MatchupRow key={mu.legend.cardId} {...mu} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LegendStatsView({ stats }: { stats: LegendStats[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("played");

  if (stats.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-16">
        Aucune statistique disponible. Ajoutez des matchs pour voir vos stats !
      </p>
    );
  }

  const sorted = [...stats].sort((a, b) => {
    if (sortKey === "winRate") return b.winRate - a.winRate;
    if (sortKey === "wins") return b.matchWins - a.matchWins;
    return b.matchesPlayed - a.matchesPlayed;
  });

  return (
    <div className="space-y-6">
      {/* Contrôles de tri */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground mr-1">Trier par :</span>
        {(
          [
            { key: "played", label: "Plus joué" },
            { key: "winRate", label: "Meilleur taux" },
            { key: "wins", label: "Plus de victoires" },
          ] as { key: SortKey; label: string }[]
        ).map(({ key, label }) => (
          <Button
            key={key}
            variant={sortKey === key ? "default" : "outline"}
            size="sm"
            onClick={() => setSortKey(key)}
          >
            {label}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">
          {stats.length} légende{stats.length > 1 ? "s" : ""}
        </span>
      </div>

      {/* Grille */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((s) => (
          <LegendCard key={s.legend.cardId} stats={s} />
        ))}
      </div>
    </div>
  );
}

