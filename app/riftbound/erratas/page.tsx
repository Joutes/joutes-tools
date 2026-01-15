import { getAllErratas } from "@/lib/data/erratas";
import { isAdmin } from "@/lib/auth-utils";
import meilisearch, { indexes } from "@/lib/meilisearch";
import { BoosterCard } from "@/lib/types/booster";
import AddErrataDialog from "./AddErrataDialog";
import ErratasClientView from "./ErratasClientView";

export default async function RiftboundErratasPage() {
  const erratas = await getAllErratas();
  const userIsAdmin = await isAdmin();

  // Récupérer les informations des cartes pour chaque errata
  const index = meilisearch.index<BoosterCard>(indexes.riftbound);
  const cardIds = [...new Set(erratas.map((e) => e.cardId))];

  const cardsMap = new Map<string, BoosterCard>();

  for (const cardId of cardIds) {
    try {
      const result = await index.getDocument(cardId);
      if (result) {
        cardsMap.set(cardId, result);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la carte ${cardId}:`, error);
    }
  }

  // Préparer les données pour le composant client
  const erratasWithCards = erratas.map((errata) => ({
    errata,
    card: cardsMap.get(errata.cardId),
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Erratas & Clarifications Riftbound</h1>
        {userIsAdmin && <AddErrataDialog />}
      </div>

      <ErratasClientView
        erratasWithCards={erratasWithCards}
        userIsAdmin={userIsAdmin}
      />
    </div>
  );
}