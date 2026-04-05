'use client';

import {useState} from "react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

type DeckListCard = { name: string; quantity: number; cardId?: string; image?: string };

type DeckList = {
  champions: DeckListCard[];
  legends: DeckListCard[];
  maindeck: DeckListCard[];
  sideboard: DeckListCard[];
  battlefields: DeckListCard[];
  runes: DeckListCard[]
};

// Parse a pasted deck list text into the DeckList structure
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
    légende: 'legends',
    légendes: 'legends',
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
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Header like "MainDeck:" or "Main Deck:" or "Legend:" etc.
    const headerMatch = line.match(/^([A-Za-z \-]+):?$/);
    if (headerMatch) {
      const key = headerMatch[1].trim().toLowerCase();
      if (map[key]) {
        current = map[key];
        continue;
      }
    }

    // Try to parse quantity + name. Accept forms: "3 Name", "2x Name", "2 x Name"
    const qtyMatch = line.match(/^\s*(\d+)\s*x?\s+(.+)$/i);
    let qty = 1;
    let name = line;
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
      name = qtyMatch[2].trim();
    } else {
      // If there's no leading number, check for lines that start with a dash or bullets
      const bulletMatch = line.replace(/^[-•]\s*/, '');
      if (bulletMatch !== line) {
        name = bulletMatch.trim();
        // no quantity -> 1
      }
    }

    // push into current section
    result[current].push({name, quantity: qty});
  }

  return result;
}

export default function RiftboundDeckCheckerPage() {
  const [rawDeckList, setRawDeckList] = useState("");
  const [deckList, setDeckList] = useState<DeckList | null>(null);

  async function importDeckList() {
    const deckId = '9e742be1-1682-4b96-844d-60cf915b6d8c';

    if (rawDeckList.startsWith('https://piltoverarchive.com/decks/view/')) {
      const deckContentResponse = await fetch(`https://piltoverarchive.com/api/external/v1/decks/${deckId}/price`);
      if (!deckContentResponse.ok) {
        throw new Error('Deck could not be retrieved from Piltover Archive.');
      }

      const deckContent = await deckContentResponse.json() as {
        breakdown: {
          champions: { name: string; quantity: number; price: number }[];
          legends: { name: string; quantity: number; price: number }[];
          maindeck: { name: string; quantity: number; price: number }[];
          sideboard: { name: string; quantity: number; price: number }[];
          battlefields: { name: string; quantity: number; price: number }[];
          runes: { name: string; quantity: number; price: number }[];
        };
      };
      const parsedDeckList: DeckList = {
        champions: deckContent.breakdown.champions.map(c => ({name: c.name, quantity: c.quantity})),
        legends: deckContent.breakdown.legends.map(c => ({name: c.name, quantity: c.quantity})),
        maindeck: deckContent.breakdown.maindeck.map(c => ({name: c.name, quantity: c.quantity})),
        sideboard: deckContent.breakdown.sideboard.map(c => ({name: c.name, quantity: c.quantity})),
        battlefields: deckContent.breakdown.battlefields.map(c => ({name: c.name, quantity: c.quantity})),
        runes: deckContent.breakdown.runes.map(c => ({name: c.name, quantity: c.quantity})),
      };
      setDeckList(parsedDeckList);
    } else {
      try {
        const parsed = parseDeckList(rawDeckList);
        setDeckList(parsed);
      } catch (err) {
        console.error('Erreur lors du parsing de la liste de deck', err);
        setDeckList(null);
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">
        Vérificateur de Deck RiftBound
      </h1>

      <div>
        {/* Section import de la liste de Deck */}
        <div>
          <Label
            htmlFor="deck-list"
            className="block text-sm font-medium mb-2"
          >
            Liste de Deck
          </Label>
          <Textarea
            id="deck-list"
            value={rawDeckList}
            onChange={(e) => setRawDeckList(e.target.value)}
            placeholder="Collez votre liste de deck... Legend:
1 Azir, Emperor of the Sands

Champion:
1 Azir, Sovereign

MainDeck:
3 Discipline
3 Hidden Blade
3 Desert's Call
3 Doran's Shield
3 Brutalizer
3 Eye of the Herald
3 B.F. Sword
2 Defy
2 Cull the Weak
2 Lonely Poro
2 Guards!
2 Deathgrip
2 Sacred Shears
1 Facebreaker
1 Salvage
1 Thwonk!
1 Guardian Angel
1 Azir, Ascendant
1 Fiora, Worthy

Battlefields:
1 Trifarian War Camp
1 Vilemaw's Lair
1 Ornn's Forge

Runes:
6 Calm Rune
6 Order Rune

Sideboard:
2 Not So Fast
1 Defy
1 Wind Wall
1 Facebreaker
1 Salvage
1 Fiora, Worthy"
            className="w-full h-96 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button onClick={importDeckList}>Valider</Button>
      </div>

      {deckList &&
        <div>
          {/* Section deck list */}
          <h2>Légendes</h2>
        </div>
      }

    </div>
  )
}