"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MatchCard, MatchGame, GameResult } from "@/lib/types/match";
import { createMatchAction } from "@/app/riftbound/game-stats/action";
import CardSearchInput from "@/app/riftbound/game-stats/CardSearchInput";
import { Plus, Trash2, Trophy, Sword } from "lucide-react";

export default function AddMatchDialog() {
  const [open, setOpen] = useState(false);
  const [userLegend, setUserLegend] = useState<MatchCard | null>(null);
  const [opponentName, setOpponentName] = useState("");
  const [opponentLegend, setOpponentLegend] = useState<MatchCard | null>(null);
  const [games, setGames] = useState<MatchGame[]>([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function addGame(result: GameResult) {
    setGames((prev) => [...prev, { result }]);
  }

  function removeGame(index: number) {
    setGames((prev) => prev.filter((_, i) => i !== index));
  }

  function reset() {
    setUserLegend(null);
    setOpponentName("");
    setOpponentLegend(null);
    setGames([]);
    setNotes("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userLegend || !opponentLegend) return;
    if (games.length === 0) {
      alert("Veuillez ajouter au moins une partie.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createMatchAction({
        userLegend,
        opponentName: opponentName.trim() || undefined,
        opponentLegend,
        games,
        notes: notes.trim() || undefined,
      });
      setOpen(false);
      reset();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du match.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const wins = games.filter((g) => g.result === "win").length;
  const losses = games.filter((g) => g.result === "loss").length;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un match
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un match</DialogTitle>
            <DialogDescription>
              Enregistrez les résultats d'un match de Riftbound.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {/* Légende jouée */}
            <CardSearchInput
              label="Votre légende *"
              value={userLegend}
              onChange={setUserLegend}
              placeholder="Rechercher votre légende..."
            />

            {/* Adversaire */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">
                Nom de l&apos;adversaire (optionnel)
              </label>
              <Input
                type="text"
                placeholder="Pseudo ou nom de l'adversaire"
                value={opponentName}
                onChange={(e) => setOpponentName(e.target.value)}
              />
            </div>

            {/* Légende adversaire */}
            <CardSearchInput
              label="Légende adverse *"
              value={opponentLegend}
              onChange={setOpponentLegend}
              placeholder="Rechercher la légende de l'adversaire..."
            />

            {/* Résultats des parties */}
            <div className="grid gap-3">
              <label className="text-sm font-medium">Résultats des parties *</label>
              {games.length > 0 && (
                <div className="space-y-2">
                  {games.map((game, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between px-3 py-2 rounded-md border text-sm font-medium ${
                        game.result === "win"
                          ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
                          : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
                      }`}
                    >
                      <span>
                        Partie {index + 1} —{" "}
                        {game.result === "win" ? (
                          <span className="inline-flex items-center gap-1">
                            <Trophy className="h-3.5 w-3.5" /> Victoire
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Sword className="h-3.5 w-3.5" /> Défaite
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGame(index)}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Score : {wins}V – {losses}D
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addGame("win")}
                  className="flex-1 text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-950"
                >
                  <Trophy className="h-4 w-4 mr-1" />
                  + Victoire
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addGame("loss")}
                  className="flex-1 text-red-700 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-950"
                >
                  <Sword className="h-4 w-4 mr-1" />
                  + Défaite
                </Button>
              </div>
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Stratégie, observations, commentaires..."
                className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || !userLegend || !opponentLegend || games.length === 0}
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

