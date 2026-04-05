'use client';

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {validateDeckList, type DeckListCard, type DeckList} from "./action";

// ── Parse a pasted deck list text into the DeckList structure ─────────────────
function parseDeckList(text: string): DeckList {
  const result: DeckList = {
    champions: [],
    legends: [],
    maindeck: [],
    sideboard: [],
    battlefields: [],
    runes: [],
  };

  const map: Record<string, keyof DeckList> = {
    legend: 'legends',
    legends: 'legends',
    'légende': 'legends',
    'légendes': 'legends',
    champion: 'champions',
    champions: 'champions',
    maindeck: 'maindeck',
    "main deck": 'maindeck',
    deck: 'maindeck',
    main: 'maindeck',
    'main-deck': 'maindeck',
    sideboard: 'sideboard',
    side: 'sideboard',
    battlefield: 'battlefields',
    battlefields: 'battlefields',
    runes: 'runes',
  };

  let current: keyof DeckList = 'maindeck';

  const lines = text.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    const headerMatch = line.match(/^([A-Za-z \-]+):?$/);
    if (headerMatch) {
      const key = headerMatch[1].trim().toLowerCase();
      if (map[key]) { current = map[key]; continue; }
    }

    const qtyMatch = line.match(/^\s*(\d+)\s*x?\s+(.+)$/i);
    let qty = 1;
    let name = line;
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
      name = qtyMatch[2].trim();
    } else {
      const bulletMatch = line.replace(/^[-\u2022]\s*/, '');
      if (bulletMatch !== line) name = bulletMatch.trim();
    }

    result[current].push({name, quantity: qty});
  }

  return result;
}

// ── Card tile ─────────────────────────────────────────────────────────────────
function CardTile({card}: {card: DeckListCard}) {
  return (
    <div className={`relative rounded-lg overflow-hidden shadow-md bg-gray-800 group${card.banned ? ' ring-2 ring-red-500' : ''}`} style={{aspectRatio: '2.5 / 3.5'}}>
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={card.image} alt={card.name} className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-700 p-2 gap-1">
          <span className="text-3xl opacity-40">?</span>
          <span className="text-red-400 text-center text-xs font-medium leading-tight line-clamp-3">{card.name}</span>
        </div>
      )}
      <div className="absolute top-1.5 left-1.5 bg-black/75 text-white text-xs font-bold rounded px-1.5 py-0.5 leading-none">
        &times;{card.quantity}
      </div>
      {card.banned ? (
        <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold rounded px-1.5 py-0.5 leading-none uppercase tracking-widest">
          BANNED
        </div>
      ) : (
        <>
          {card.erratas && card.erratas.length > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-yellow-600 text-white text-[10px] font-bold rounded px-1.5 py-0.5 leading-none uppercase tracking-widest">
              NOTES
            </div>
          )}
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-4 pb-1.5 px-1.5">
        <p className={`text-xs font-medium truncate ${!card.recognized ? 'text-red-400' : 'text-white'}`}>
          {card.name}
        </p>
      </div>
    </div>
  );
}

// ── Section grid ──────────────────────────────────────────────────────────────
function DeckSection({title, cards, compact}: {title: string; cards: DeckListCard[]; compact?: boolean}) {
  if (cards.length === 0) return null;
  const total = cards.reduce((sum, c) => sum + c.quantity, 0);
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">({total} carte{total > 1 ? 's' : ''})</span>
      </div>
      <div className={compact
        ? "grid grid-cols-2 gap-2"
        : "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2"}>
        {cards.map((card, idx) => <CardTile key={`${card.name}-${idx}`} card={card} />)}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function RiftboundDeckCheckerPage() {
  const [rawDeckList, setRawDeckList] = useState("");
  const [deckList, setDeckList] = useState<DeckList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function importDeckList() {
    setIsLoading(true);
    setError(null);
    try {
      let parsed: DeckList;

      if (rawDeckList.startsWith('https://piltoverarchive.com/decks/view/')) {
        const deckId = rawDeckList.split('/').at(-1)!;
        const res = await fetch(`https://piltoverarchive.com/api/external/v1/decks/${deckId}/price`);
        if (!res.ok) throw new Error('Impossible de récupérer le deck depuis Piltover Archive.');
        const data = await res.json() as {
          breakdown: { champions: {name:string;quantity:number}[]; legends: {name:string;quantity:number}[]; maindeck: {name:string;quantity:number}[]; sideboard: {name:string;quantity:number}[]; battlefields: {name:string;quantity:number}[]; runes: {name:string;quantity:number}[]; };
        };
        parsed = {
          champions:   data.breakdown.champions.map(c => ({name: c.name, quantity: c.quantity})),
          legends:     data.breakdown.legends.map(c => ({name: c.name, quantity: c.quantity})),
          maindeck:    data.breakdown.maindeck.map(c => ({name: c.name, quantity: c.quantity})),
          sideboard:   data.breakdown.sideboard.map(c => ({name: c.name, quantity: c.quantity})),
          battlefields:data.breakdown.battlefields.map(c => ({name: c.name, quantity: c.quantity})),
          runes:       data.breakdown.runes.map(c => ({name: c.name, quantity: c.quantity})),
        };
      } else {
        parsed = parseDeckList(rawDeckList);
      }

      setDeckList(await validateDeckList(parsed));
    } catch (err) {
      console.error("Erreur lors de l'import de la liste de deck", err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setDeckList(null);
    } finally {
      setIsLoading(false);
    }
  }

  const allCards = deckList ? [...deckList.legends, ...deckList.champions, ...deckList.maindeck, ...deckList.battlefields, ...deckList.runes, ...deckList.sideboard] : [];
  const unrecognized = allCards.filter(c => !c.recognized);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Vérificateur de Deck RiftBound</h1>

      <div className="mb-8">
        <div className="mb-3">
          <Label htmlFor="deck-list" className="block text-sm font-medium mb-2">
            Liste de Deck (texte ou lien Piltover Archive)
          </Label>
          <Textarea
            id="deck-list"
            value={rawDeckList}
            onChange={(e) => setRawDeckList(e.target.value)}
            placeholder={"Collez votre liste de deck ou un lien https://piltoverarchive.com/decks/view/...\n\nLegend:\n1 Azir, Emperor of the Sands\n\nChampion:\n1 Azir, Sovereign\n\nMainDeck:\n3 Discipline\n..."}
            className="w-full h-60 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button onClick={importDeckList} disabled={isLoading || !rawDeckList.trim()}>
          {isLoading ? 'Validation en cours\u2026' : 'Valider'}
        </Button>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {deckList && (
          <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DeckSection title="Légende" cards={deckList.legends} compact />
            <DeckSection title="Champion" cards={deckList.champions} compact />
            <DeckSection title="Champs de bataille" cards={deckList.battlefields} compact />
            <DeckSection title="Runes" cards={deckList.runes} compact />
          </div>
          <DeckSection title="Main Deck" cards={deckList.maindeck} />
          <DeckSection title="Sideboard" cards={deckList.sideboard} />

          {unrecognized.length > 0 && (
            <div className="border border-red-500/40 rounded-lg p-4 bg-red-950/20">
              <h3 className="text-sm font-semibold text-red-400 mb-2">&#9888; Cartes non reconnues</h3>
              <ul className="list-disc list-inside space-y-0.5">
                {unrecognized.map((c, i) => <li key={i} className="text-red-400 text-sm">{c.name}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}