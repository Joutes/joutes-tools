"use server";

import { auth } from "@/lib/auth";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { extract } from "fuzzball";

export interface VerifyDeckResult {
  extractedCards: string[];
  missing: string[]; // Cartes dans la liste mais pas sur la photo
  extra: string[]; // Cartes sur la photo mais pas dans la liste
  matched: string[]; // Cartes qui correspondent
}

export async function verifyDeck(
  deckList: string,
  imageBase64: string
): Promise<VerifyDeckResult> {
  const session = await auth.api.getSession();
  if (session?.user.email !== process.env.ADMIN_EMAIL) {
    throw new Error('Unauthorized');
  }

  // Extraire les cartes de la photo avec OpenAI Vision
  const { text } = await generateText({
    model: openai("gpt-4o"),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract all card names from this Star Wars Unlimited deck photo. Return ONLY a list of card names, one per line, without any additional text, formatting, or numbering. If the card is in the photo multiple times, list it multiple times, one per line.",
          },
          {
            type: "image",
            image: imageBase64,
          },
        ],
      },
    ],
  });

  // Parser les listes
  const extractedCards = parseCardList(text);
  const deckCards = parseCardList(deckList);

  // Fuzzy matching pour comparer les listes
  const matched: string[] = [];
  const missing: string[] = [];
  const extra: string[] = [];

  // Normaliser les noms de cartes extraites
  const normalizedExtracted = extractedCards.map(normalizeCardName);

  // Pour chaque carte du deck, chercher une correspondance dans la photo
  for (const deckCard of deckCards) {
    const normalizedDeck = normalizeCardName(deckCard);
    const match = extract(normalizedDeck, normalizedExtracted, {
      scorer: (a: string, b: string) => {
        return fuzzyScore(a, b);
      },
      limit: 1,
      cutoff: 70, // Seuil de 70% de similarité
    });

    if (match.length > 0 && match[0][1] >= 70) {
      matched.push(deckCard);
      // Retirer la carte matchée pour éviter les doublons
      const matchIndex = normalizedExtracted.indexOf(match[0][0]);
      if (matchIndex > -1) {
        normalizedExtracted.splice(matchIndex, 1);
        extractedCards.splice(matchIndex, 1);
      }
    } else {
      missing.push(deckCard);
    }
  }

  // Les cartes restantes dans extractedCards sont en trop
  extra.push(...extractedCards);

  return {
    extractedCards: extractedCards,
    missing,
    extra,
    matched,
  };
}

function parseCardList(text: string): string[] {
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      // Retirer les numéros de ligne ou puces
      .map((line) => line.replace(/^[\d\-•*]+[\.\):\s]*/, "").trim())
      .filter((line) => line.length > 0)
  );
}

function normalizeCardName(cardName: string): string {
  // Retirer les quantités (2x, x2, etc.)
  let normalized = cardName.replace(/^\d+x\s*/i, "").replace(/\s*x\d+$/i, "");
  // Retirer la ponctuation et mettre en minuscule
  normalized = normalized
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return normalized;
}

function fuzzyScore(a: string, b: string): number {
  // Implémentation simple de Levenshtein distance
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  const distance = matrix[b.length][a.length];
  const maxLength = Math.max(a.length, b.length);
  return ((maxLength - distance) / maxLength) * 100;
}
