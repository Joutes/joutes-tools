"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { verifyDeck, type VerifyDeckResult } from "./action";


export default function SWUDeckCheckerPage() {
  const [deckList, setDeckList] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerifyDeckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerify = async () => {
    if (!deckList.trim()) {
      setError("Veuillez entrer une liste de deck");
      return;
    }

    if (!imageFile) {
      setError("Veuillez ajouter une photo du deck");
      return;
    }

    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      // Convertir l'image en base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const verifyResult = await verifyDeck(deckList, base64);
          setResult(verifyResult);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Erreur lors de la vérification"
          );
        } finally {
          setIsVerifying(false);
        }
      };
      reader.onerror = () => {
        setError("Erreur lors de la lecture de l'image");
        setIsVerifying(false);
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la vérification"
      );
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">
        Vérificateur de Deck Star Wars Unlimited
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Liste de Deck */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="deck-list"
              className="block text-sm font-medium mb-2"
            >
              Liste de Deck
            </label>
            <textarea
              id="deck-list"
              value={deckList}
              onChange={(e) => setDeckList(e.target.value)}
              placeholder="Collez votre liste de deck ici...&#10;Exemple:&#10;2x Luke Skywalker&#10;3x Darth Vader&#10;1x Obi-Wan Kenobi"
              className="w-full h-96 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Section Image */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photo du Deck
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="deck-image"
              />
              <Button asChild variant="outline" className="w-full">
                <label htmlFor="deck-image" className="cursor-pointer">
                  {imageFile ? "Changer la photo" : "Ajouter une photo"}
                </label>
              </Button>

              {imagePreview && (
                <div className="border rounded-lg p-2">
                  <img
                    src={imagePreview}
                    alt="Aperçu du deck"
                    className="w-full h-auto max-h-64 object-contain rounded"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bouton Vérifier */}
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !deckList.trim() || !imageFile}
            className="w-full"
            size="lg"
          >
            {isVerifying ? "Vérification en cours..." : "Vérifier"}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
        </div>

        {/* Section Résultats */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Résultats</h2>

          {!result && (
            <div className="p-8 border-2 border-dashed rounded-lg text-center text-gray-500">
              Les résultats de la vérification apparaîtront ici
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Cartes Correspondantes */}
              {result.matched.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">
                    ✓ Cartes Correspondantes ({result.matched.length})
                  </h3>
                  <ul className="space-y-1">
                    {result.matched.map((card, idx) => (
                      <li key={idx} className="text-sm text-green-700">
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cartes Manquantes */}
              {result.missing.length > 0 && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">
                    ⚠ Cartes Manquantes sur la Photo ({result.missing.length})
                  </h3>
                  <ul className="space-y-1">
                    {result.missing.map((card, idx) => (
                      <li key={idx} className="text-sm text-orange-700">
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Cartes en Trop */}
              {result.extra.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    ℹ Cartes en Trop sur la Photo ({result.extra.length})
                  </h3>
                  <ul className="space-y-1">
                    {result.extra.map((card, idx) => (
                      <li key={idx} className="text-sm text-blue-700">
                        {card}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Résumé */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Résumé</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Cartes extraites:</span>
                    <span className="ml-2 font-semibold">
                      {result.extractedCards.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Cartes dans la liste:</span>
                    <span className="ml-2 font-semibold">
                      {result.matched.length + result.missing.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Correspondances:</span>
                    <span className="ml-2 font-semibold text-green-600">
                      {result.matched.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Différences:</span>
                    <span className="ml-2 font-semibold text-orange-600">
                      {result.missing.length + result.extra.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}