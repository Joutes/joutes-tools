'use client';

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Color = "Fury" | "Calm" | "Mind" | "Body" | "Chaos" | "Order";

const COLORS: { name: Color; bg: string; text: string; border: string; inactiveBorder: string }[] = [
  { name: "Fury",  bg: "bg-red-500",    text: "text-white", border: "border-red-500",    inactiveBorder: "border-red-300    hover:border-red-500"    },
  { name: "Calm",  bg: "bg-blue-500",   text: "text-white", border: "border-blue-500",   inactiveBorder: "border-blue-300   hover:border-blue-500"   },
  { name: "Mind",  bg: "bg-purple-500", text: "text-white", border: "border-purple-500", inactiveBorder: "border-purple-300 hover:border-purple-500" },
  { name: "Body",  bg: "bg-green-500",  text: "text-white", border: "border-green-500",  inactiveBorder: "border-green-300  hover:border-green-500"  },
  { name: "Chaos", bg: "bg-orange-500", text: "text-white", border: "border-orange-500", inactiveBorder: "border-orange-300 hover:border-orange-500" },
  { name: "Order", bg: "bg-yellow-400", text: "text-black", border: "border-yellow-400", inactiveBorder: "border-yellow-300 hover:border-yellow-400" },
];

interface Player {
  id: string;
  pseudo: string;
  legend: string;
  colors: Color[];
  champion: string;
}

interface Turn {
  id: string;
  playerId: string;
}

// ─── Setup ────────────────────────────────────────────────────────────────────

function makePlayer(): Player {
  return { id: crypto.randomUUID(), pseudo: "", legend: "", colors: [], champion: "" };
}

function SetupPhase({ onStart }: { onStart: (players: Player[]) => void }) {
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>(() =>
    Array.from({ length: 2 }, makePlayer)
  );

  const updatePlayerCount = (count: number) => {
    setPlayerCount(count);
    setPlayers((prev) =>
      count > prev.length
        ? [...prev, ...Array.from({ length: count - prev.length }, makePlayer)]
        : prev.slice(0, count)
    );
  };

  const updatePlayer = <K extends keyof Player>(id: string, field: K, value: Player[K]) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const toggleColor = (playerId: string, color: Color) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id !== playerId) return p;
        const colors = p.colors.includes(color)
          ? p.colors.filter((c) => c !== color)
          : [...p.colors, color];
        return { ...p, colors };
      })
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Game Tracker</h1>
      <p className="text-muted-foreground mb-8">Configurez les joueurs avant de lancer la partie.</p>

      {/* Nombre de joueurs */}
      <div className="mb-8">
        <label className="block text-sm font-medium mb-3">Nombre de joueurs</label>
        <div className="flex gap-2">
          {[2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              onClick={() => updatePlayerCount(n)}
              className={cn(
                "w-10 h-10 rounded-full border-2 font-bold text-sm transition-all",
                playerCount === n
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground hover:border-primary"
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Formulaire joueurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-10">
        {players.map((player, index) => (
          <div key={player.id} className="border rounded-xl p-5 space-y-4 bg-card">
            <h2 className="font-semibold text-base">Joueur {index + 1}</h2>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Pseudo</label>
              <Input
                value={player.pseudo}
                onChange={(e) => updatePlayer(player.id, "pseudo", e.target.value)}
                placeholder="Pseudo du joueur"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Légende jouée</label>
              <Input
                value={player.legend}
                onChange={(e) => updatePlayer(player.id, "legend", e.target.value)}
                placeholder="Légende"
              />
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-2">Couleurs jouées</label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((color) => {
                  const active = player.colors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      onClick={() => toggleColor(player.id, color.name)}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold border-2 transition-all select-none",
                        active
                          ? cn(color.bg, color.text, color.border)
                          : cn("bg-transparent text-muted-foreground", color.inactiveBorder)
                      )}
                    >
                      {color.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs text-muted-foreground mb-1">Champion joué</label>
              <Input
                value={player.champion}
                onChange={(e) => updatePlayer(player.id, "champion", e.target.value)}
                placeholder="Champion"
              />
            </div>
          </div>
        ))}
      </div>

      <Button size="lg" onClick={() => onStart(players)}>
        Lancer la partie
      </Button>
    </div>
  );
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

function TrackingPhase({ players, onReset }: { players: Player[]; onReset: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([]);

  const addTurn = (playerId: string) =>
    setTurns((prev) => [...prev, { id: crypto.randomUUID(), playerId }]);

  const deleteTurn = (turnId: string) =>
    setTurns((prev) => prev.filter((t) => t.id !== turnId));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h1 className="text-xl font-bold">Game Tracker — Riftbound</h1>
        <Button variant="outline" size="sm" onClick={onReset}>
          Nouvelle partie
        </Button>
      </div>

      {/* Scrollable zone */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse min-w-max w-full">
          {/* En-têtes joueurs */}
          <thead className="sticky top-0 z-10 bg-background">
            <tr>
              {/* Colonne numéro de tour */}
              <th className="w-16 border-b border-r p-3 text-xs font-medium text-muted-foreground text-center align-bottom">
                Tour
              </th>
              {players.map((player) => {
                return (
                  <th
                    key={player.id}
                    className="w-52 border-b border-r last:border-r-0 p-3 text-left align-top"
                  >
                    <div className="font-semibold text-sm">
                      {player.pseudo || "Joueur"}
                    </div>
                    {player.legend && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {player.legend}
                      </div>
                    )}
                    {player.champion && (
                      <div className="text-xs text-muted-foreground">
                        Champion : {player.champion}
                      </div>
                    )}
                    {player.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {player.colors.map((c) => {
                          const def = COLORS.find((col) => col.name === c)!;
                          return (
                            <span
                              key={c}
                              className={cn(
                                "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                                def.bg,
                                def.text
                              )}
                            >
                              {c}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Lignes de tours */}
          <tbody>
            {turns.length === 0 && (
              <tr>
                <td
                  colSpan={players.length + 1}
                  className="text-center py-16 text-muted-foreground text-sm"
                >
                  Cliquez sur &quot;Nouveau Tour&quot; pour démarrer le suivi de la partie.
                </td>
              </tr>
            )}
            {turns.map((turn, index) => (
              <tr key={turn.id} className="group border-b hover:bg-muted/20">
                {/* Numéro + suppression */}
                <td className="w-16 border-r text-center align-middle p-2">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-sm font-medium tabular-nums">{index + 1}</span>
                    <button
                      onClick={() => deleteTurn(turn.id)}
                      title="Supprimer ce tour"
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/70 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>

                {/* Cellules joueurs */}
                {players.map((player) => {
                  const isActive = player.id === turn.playerId;
                  return (
                    <td
                      key={player.id}
                      className={cn(
                        "w-52 h-14 border-r last:border-r-0 align-middle",
                        isActive
                          ? "bg-primary/10 border-l-[3px] border-l-primary"
                          : ""
                      )}
                    >
                      {isActive && (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-sm font-semibold text-primary px-3">
                            Tour {index + 1}
                          </span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer : boutons "Nouveau Tour" */}
      <div className="shrink-0 border-t bg-background">
        <div className="flex">
          {/* Espace aligné avec la colonne "Tour" */}
          <div className="w-16 shrink-0 border-r" />
          {players.map((player) => (
            <div
              key={player.id}
              className="w-52 shrink-0 p-2 border-r last:border-r-0"
            >
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => addTurn(player.id)}
              >
                Nouveau Tour
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RiftboundTrackerPage() {
  const [players, setPlayers] = useState<Player[] | null>(null);

  if (!players) {
    return <SetupPhase onStart={setPlayers} />;
  }

  return <TrackingPhase players={players} onReset={() => setPlayers(null)} />;
}
