// ── Parse a pasted deck list text into the DeckList structure ─────────────────
import {DeckList} from "@/app/riftbound/deck-checker/action";

export function parseDeckList(text: string): DeckList {
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

    const qtyMatch = line.match(/^\s*[xX\-*]*?(\d+)\s*x?\s+(.+)$/i);
    let qty = 1;
    let name = line;
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
      name = qtyMatch[2].trim();
    } else {
      const bulletMatch = line.replace(/^[-\u2022]\s*/, '');
      if (bulletMatch !== line) name = bulletMatch.trim();
    }

    const existingCard = result[current].find(c => c.name === name);
    if (existingCard) {
      existingCard.quantity += 1;
    } else {
      result[current].push({name, quantity: qty});
    }
  }

  return result;
}