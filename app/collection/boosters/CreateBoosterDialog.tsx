"use client";

import {useState, useTransition} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {Game} from "@/lib/types/game";
import {createBooster} from "./action";
import {langToFlag} from "@/lib/langs";

type Props = {
  games: Game[];
};

const BOOSTER_TYPES: Record<string, {value: string; label: string}[]> = {
  swu: [
    {value: "CARBONITE", label: "Carbonite"},
    {value: "AP", label: "Avant-première"},
    {value: "WEEKLY", label: "Weekly"},
    {value: "SET", label: "Set"},
    {value: "OTHER", label: "Autre"},
  ],
  magic: [
    {value: "PLAY", label: "Play"},
    {value: "SET", label: "Set"},
    {value: "AP", label: "Avant-première"},
    {value: "COLLECTOR", label: "Collector"},
    {value: "OTHER", label: "Autre"},
  ],
  riftbound: [
    {value: "SET", label: "Set"},
    {value: "NEXUS", label: "Nexus"},
    {value: "AP", label: "Avant-première"},
    {value: "OTHER", label: "Autre"},
  ],
};

const LANGUAGES = [
  {value: "fr", label: "Français", flag: "🇫🇷"},
  {value: "en", label: "Anglais", flag: "🇬🇧"},
  {value: "de", label: "Allemand", flag: "🇩🇪"},
  {value: "es", label: "Espagnol", flag: "🇪🇸"},
  {value: "it", label: "Italien", flag: "🇮🇹"},
  {value: "pt", label: "Portugais", flag: "🇵🇹"},
  {value: "ja", label: "Japonais", flag: "🇯🇵"},
  {value: "ko", label: "Coréen", flag: "🇰🇷"},
];

export function CreateBoosterDialog({games}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [setCode, setSetCode] = useState<string>("");
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const selectedGame = games.find((g) => g.id === selectedGameId);
  const boosterTypes = selectedGame?.name.toLowerCase() === "star wars unlimited"
    ? BOOSTER_TYPES.swu
    : selectedGame?.name.toLowerCase() === "magic: the gathering"
    ? BOOSTER_TYPES.magic
    : selectedGame?.name.toLowerCase() === "riftbound"
    ? BOOSTER_TYPES.riftbound
    : [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createBooster(formData);
      if (result.success) {
        setOpen(false);
        setSelectedGameId("");
        setSelectedType("");
        setSetCode("");
        setSelectedLang("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un booster</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau booster</DialogTitle>
          <DialogDescription>
            Renseignez les informations du booster à ajouter à votre collection.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Sélection du jeu */}
            <div className="grid gap-2">
              <label htmlFor="gameId" className="text-sm font-medium">
                Jeu
              </label>
              <Select
                name="gameId"
                value={selectedGameId}
                onValueChange={setSelectedGameId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un jeu"/>
                </SelectTrigger>
                <SelectContent>
                  {games.map((game) => (
                    <SelectItem key={game.id} value={game.id}>
                      {game.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sélection du type de booster */}
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Type de booster
              </label>
              <Select
                name="type"
                value={selectedType}
                onValueChange={setSelectedType}
                disabled={!selectedGameId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type"/>
                </SelectTrigger>
                <SelectContent>
                  {boosterTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code de set */}
            <div className="grid gap-2">
              <label htmlFor="setCode" className="text-sm font-medium">
                Code de set
              </label>
              <Input
                id="setCode"
                name="setCode"
                placeholder="ex: SOR, MKM, RFB01"
                value={setCode}
                onChange={(e) => setSetCode(e.target.value)}
                required
              />
            </div>

            {/* Langue */}
            <div className="grid gap-2">
              <label htmlFor="lang" className="text-sm font-medium">
                Langue
              </label>
              <Select
                name="lang"
                value={selectedLang}
                onValueChange={setSelectedLang}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une langue"/>
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.flag} {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Création..." : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
