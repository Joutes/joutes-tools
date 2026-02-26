'use client';

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Color = "Fury" | "Calm" | "Mind" | "Body" | "Chaos" | "Order";
type RuneState = "ready" | "exhausted" | "recycled";

const COLORS: {
  name: Color;
  bg: string;
  text: string;
  border: string;
  inactiveBorder: string;
}[] = [
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

interface Rune {
  id: string;
  color: Color;
  state: RuneState;
}

interface TurnEvent {
  id: string;
  playerId: string;
  label: string;
}

interface Turn {
  id: string;
  playerId: string;
  /** Snapshot des runes à la création du tour (sans recyclées, toutes en ready) */
  runeSnapshot: Record<string, Rune[]>;
  events: TurnEvent[];
}

interface PlayerGameState {
  score: number;
  runes: Rune[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makePlayer(): Player {
  return { id: crypto.randomUUID(), pseudo: "", legend: "", colors: [], champion: "" };
}

function makePlayerGameState(): PlayerGameState {
  return { score: 0, runes: [] };
}

function colorDef(color: Color) {
  return COLORS.find((c) => c.name === color)!;
}

// ─── RuneIcon ─────────────────────────────────────────────────────────────────

function RuneIcon({
  rune,
  interactive = false,
  onClick,
}: {
  rune: Rune;
  interactive?: boolean;
  onClick?: () => void;
}) {
  const def = colorDef(rune.color);
  const isVertical = rune.state === "ready";
  const isRecycled = rune.state === "recycled";

  const shape = (
    <div
      className={cn(
        "relative rounded-sm transition-all",
        def.bg,
        isVertical ? "w-4 h-8" : "w-8 h-4",
        isRecycled && "opacity-60",
      )}
    >
      {isRecycled && (
        <X
          className={cn(
            "absolute inset-0 m-auto w-3 h-3",
            rune.color === "Order" ? "text-black/70" : "text-white/80",
          )}
        />
      )}
    </div>
  );

  if (!interactive) return <div className="flex items-end">{shape}</div>;

  return (
    <button
      onClick={onClick}
      title={
        rune.state === "ready"
          ? "Épuiser"
          : rune.state === "exhausted"
            ? "Recycler"
            : "Supprimer"
      }
      className="flex items-end hover:scale-110 transition-transform"
    >
      {shape}
    </button>
  );
}

// ─── PlayerHeader ─────────────────────────────────────────────────────────────

function PlayerHeader({
  player,
  gameState,
  hasTurn,
  onScoreChange,
}: {
  player: Player;
  gameState: PlayerGameState;
  hasTurn: boolean;
  onScoreChange: (delta: number) => void;
}) {
  return (
    <div className="space-y-2 text-left">
      <div className="font-semibold text-sm">{player.pseudo || "Joueur"}</div>
      {player.legend && (
        <div className="text-xs text-muted-foreground">{player.legend}</div>
      )}
      {player.champion && (
        <div className="text-xs text-muted-foreground">
          Champion : {player.champion}
        </div>
      )}
      {player.colors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {player.colors.map((c) => {
            const def = colorDef(c);
            return (
              <span
                key={c}
                className={cn(
                  "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
                  def.bg,
                  def.text,
                )}
              >
                {c}
              </span>
            );
          })}
        </div>
      )}

      {/* Score */}
      <div className="flex items-center gap-2 pt-1">
        <button
          disabled={!hasTurn}
          onClick={() => onScoreChange(-1)}
          title="Retirer un point"
          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Minus className="w-3 h-3" />
        </button>
        <span className="text-lg font-bold tabular-nums w-8 text-center">
          {gameState.score}
        </span>
        <button
          disabled={!hasTurn}
          onClick={() => onScoreChange(+1)}
          title="Ajouter un point"
          className="w-6 h-6 rounded border flex items-center justify-center hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
}

// ─── TurnCell ─────────────────────────────────────────────────────────────────

function TurnCell({
  turn,
  player,
  isActive,
  turnIndex,
  isLastTurn,
  gameState,
  onRuneClick,
  onAddRune,
}: {
  turn: Turn;
  player: Player;
  isActive: boolean;
  turnIndex: number;
  isLastTurn: boolean;
  gameState: PlayerGameState;
  onRuneClick: (runeId: string) => void;
  onAddRune: (color: Color) => void;
}) {
  const snapshot = turn.runeSnapshot[player.id] ?? [];
  const events = turn.events.filter((e) => e.playerId === player.id);
  const displayRunes = isLastTurn ? gameState.runes : snapshot;

  return (
    <div
      className={cn(
        "p-2 min-h-14 flex flex-col gap-1",
        isActive && "bg-primary/10",
      )}
    >
      {isActive && (
        <div className="text-xs font-semibold text-primary mb-0.5">
          Tour {turnIndex + 1}
        </div>
      )}

      {/* Runes : live (dernier tour) ou snapshot (tours précédents) */}
      {displayRunes.length > 0 && (
        <div className="flex flex-wrap gap-1 items-end">
          {displayRunes.map((rune) =>
            isLastTurn ? (
              <RuneIcon
                key={rune.id}
                rune={rune}
                interactive
                onClick={() => onRuneClick(rune.id)}
              />
            ) : (
              <RuneIcon key={rune.id} rune={rune} />
            ),
          )}
        </div>
      )}

      {/* Boutons d'ajout de rune — dernier tour uniquement */}
      {isLastTurn && player.colors.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {player.colors.map((c) => {
            const def = colorDef(c);
            return (
              <button
                key={c}
                onClick={() => onAddRune(c)}
                title={`Ajouter rune ${c}`}
                className={cn(
                  "w-4 h-4 rounded-sm border opacity-50 hover:opacity-100 transition-opacity",
                  def.bg,
                  def.border,
                )}
              />
            );
          })}
        </div>
      )}

      {events.map((ev) => (
        <div
          key={ev.id}
          className="text-[11px] text-muted-foreground italic leading-tight"
        >
          {ev.label}
        </div>
      ))}
    </div>
  );
}

// ─── Setup ────────────────────────────────────────────────────────────────────

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
                          : cn("bg-transparent text-muted-foreground", color.inactiveBorder),
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

interface TrackingPhaseProps {
  players: Player[];
  turns: Turn[];
  playerStates: Record<string, PlayerGameState>;
  addTurn: (playerId: string) => void;
  deleteTurn: (turnId: string) => void;
  changeScore: (playerId: string, delta: number) => void;
  cycleRune: (playerId: string, runeId: string) => void;
  addRune: (playerId: string, color: Color) => void;
  onReset: () => void;
}

function TrackingPhase({
  players,
  turns,
  playerStates,
  addTurn,
  deleteTurn,
  changeScore,
  cycleRune,
  addRune,
  onReset,
}: TrackingPhaseProps) {
  const hasTurn = turns.length > 0;

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
              <th className="w-16 border-b border-r p-3 text-xs font-medium text-muted-foreground text-center align-bottom">
                Tour
              </th>
              {players.map((player) => (
                <th
                  key={player.id}
                  className="w-56 border-b border-r last:border-r-0 p-3 align-top"
                >
                  <PlayerHeader
                    player={player}
                    gameState={playerStates[player.id] ?? { score: 0, runes: [] }}
                    hasTurn={hasTurn}
                    onScoreChange={(delta) => changeScore(player.id, delta)}
                  />
                </th>
              ))}
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
              <tr key={turn.id} className="group border-b hover:bg-muted/10">
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
                {players.map((player) => (
                  <td
                    key={player.id}
                    className={cn(
                      "w-56 border-r last:border-r-0 align-top",
                      player.id === turn.playerId && "border-l-[3px] border-l-primary",
                    )}
                  >
                    <TurnCell
                      turn={turn}
                      player={player}
                      isActive={player.id === turn.playerId}
                      turnIndex={index}
                      isLastTurn={index === turns.length - 1}
                      gameState={playerStates[player.id] ?? { score: 0, runes: [] }}
                      onRuneClick={(runeId) => cycleRune(player.id, runeId)}
                      onAddRune={(color) => addRune(player.id, color)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer : boutons "Nouveau Tour" */}
      <div className="shrink-0 border-t bg-background">
        <div className="flex">
          <div className="w-16 shrink-0 border-r" />
          {players.map((player) => (
            <div key={player.id} className="w-56 shrink-0 p-2 border-r last:border-r-0">
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

// ─── Persistence ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "riftbound-tracker";

interface PersistedState {
  players: Player[];
  turns: Turn[];
  playerStates: Record<string, PlayerGameState>;
}

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function saveState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // quota exceeded ou SSR – on ignore
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RiftboundTrackerPage() {
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [playerStates, setPlayerStates] = useState<Record<string, PlayerGameState>>({});
  const [hydrated, setHydrated] = useState(false);

  // Chargement depuis localStorage après hydratation
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setPlayers(saved.players);
      setTurns(saved.turns);
      setPlayerStates(saved.playerStates ?? {});
    }
    setHydrated(true);
  }, []);

  // Sauvegarde à chaque changement d'état
  useEffect(() => {
    if (!hydrated) return;
    if (!players) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      saveState({ players, turns, playerStates });
    }
  }, [players, turns, playerStates, hydrated]);

  // ── Handlers ──

  const handleStart = (newPlayers: Player[]) => {
    const states: Record<string, PlayerGameState> = {};
    newPlayers.forEach((p) => { states[p.id] = makePlayerGameState(); });
    setPlayerStates(states);
    setPlayers(newPlayers);
    setTurns([]);
  };

  const addTurn = (playerId: string) => {
    const snapshot: Record<string, Rune[]> = {};

    setPlayerStates((prev) => {
      const next = { ...prev };
      for (const pid of Object.keys(prev)) {
        const current = prev[pid].runes;
        snapshot[pid] = current
          .filter((r) => r.state !== "recycled")
          .map((r) => ({ ...r, state: "ready" as const }));
        next[pid] = {
          ...prev[pid],
          runes: current.map((r) =>
            r.state === "exhausted" ? { ...r, state: "ready" as const } : r,
          ),
        };
      }
      return next;
    });

    setTurns((prev) => [
      ...prev,
      { id: crypto.randomUUID(), playerId, runeSnapshot: snapshot, events: [] },
    ]);
  };

  const deleteTurn = (turnId: string) =>
    setTurns((prev) => prev.filter((t) => t.id !== turnId));

  const changeScore = (playerId: string, delta: number) => {
    setPlayerStates((prev) => {
      const current = prev[playerId] ?? makePlayerGameState();
      return { ...prev, [playerId]: { ...current, score: current.score + delta } };
    });
    setTurns((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      const abs = Math.abs(delta);
      const label =
        delta > 0
          ? `A gagné ${abs} point${abs > 1 ? "s" : ""}`
          : `A perdu ${abs} point${abs > 1 ? "s" : ""}`;
      const event: TurnEvent = { id: crypto.randomUUID(), playerId, label };
      return [...prev.slice(0, -1), { ...last, events: [...last.events, event] }];
    });
  };

  const cycleRune = (playerId: string, runeId: string) => {
    setPlayerStates((prev) => {
      const current = prev[playerId] ?? makePlayerGameState();
      const target = current.runes.find((r) => r.id === runeId);
      if (!target) return prev;
      let runes: Rune[];
      if (target.state === "ready") {
        runes = current.runes.map((r) =>
          r.id === runeId ? { ...r, state: "exhausted" as const } : r,
        );
      } else if (target.state === "exhausted") {
        runes = current.runes.map((r) =>
          r.id === runeId ? { ...r, state: "recycled" as const } : r,
        );
      } else {
        // recycled → suppression
        runes = current.runes.filter((r) => r.id !== runeId);
      }
      return { ...prev, [playerId]: { ...current, runes } };
    });
  };

  const addRune = (playerId: string, color: Color) => {
    setPlayerStates((prev) => {
      const current = prev[playerId] ?? makePlayerGameState();
      const newRune: Rune = { id: crypto.randomUUID(), color, state: "ready" };
      return { ...prev, [playerId]: { ...current, runes: [...current.runes, newRune] } };
    });
  };

  const handleReset = () => {
    setPlayers(null);
    setTurns([]);
    setPlayerStates({});
  };

  if (!hydrated) return null;

  if (!players) {
    return <SetupPhase onStart={handleStart} />;
  }

  return (
    <TrackingPhase
      players={players}
      turns={turns}
      playerStates={playerStates}
      addTurn={addTurn}
      deleteTurn={deleteTurn}
      changeScore={changeScore}
      cycleRune={cycleRune}
      addRune={addRune}
      onReset={handleReset}
    />
  );
}

