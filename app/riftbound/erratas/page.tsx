import { getAllErratas } from "@/lib/data/erratas";
import { isAdmin } from "@/lib/auth-utils";
import meilisearch, { indexes } from "@/lib/meilisearch";
import { BoosterCard } from "@/lib/types/booster";
import AddErrataDialog from "./AddErrataDialog";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import DeleteErrataButton from "@/components/DeleteErrataButton";
import EditErrataDialog from "@/components/EditErrataDialog";

export default async function RiftboundErratasPage() {
  const erratas = await getAllErratas();
  const userIsAdmin = await isAdmin();

  // Récupérer les informations des cartes pour chaque errata
  const index = meilisearch.index<BoosterCard>(indexes.riftbound);
  const cardIds = [...new Set(erratas.map((e) => e.cardId))];
  
  const cardsMap = new Map<string, BoosterCard>();
  
  for (const cardId of cardIds) {
    try {
      const result = await index.search("", {
        filter: [`cardId = ${cardId}`],
        limit: 1,
      });
      if (result.hits[0]) {
        cardsMap.set(cardId, result.hits[0]);
      }
    } catch (error) {
      console.error(`Erreur lors de la récupération de la carte ${cardId}:`, error);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Erratas & Clarifications Riftbound</h1>
        {userIsAdmin && <AddErrataDialog />}
      </div>

      {erratas.length === 0 ? (
        <p className="text-muted-foreground">
          Aucun errata ou clarification enregistré.
        </p>
      ) : (
        <div className="space-y-6">
          {erratas.map((errata) => {
            const card = cardsMap.get(errata.cardId);
            return (
              <div
                key={errata.id}
                className="border rounded-lg p-6 bg-card shadow-sm"
              >
                <div className="flex gap-4">
                  {card && (
                    <Link href={`/riftbound/cards/${errata.cardId}`}>
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-32 h-auto rounded-md hover:shadow-lg transition-shadow cursor-pointer"
                      />
                    </Link>
                  )}
                  <div className="flex-1">
                    {card && (
                      <Link href={`/riftbound/cards/${errata.cardId}`}>
                        <h3 className="text-xl font-semibold mb-2 hover:underline">
                          {card.name}
                        </h3>
                      </Link>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            errata.type === "errata"
                              ? "bg-red-100 text-red-800"
                              : errata.type === "clarification"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {errata.type === "errata"
                            ? "Errata"
                            : errata.type === "clarification"
                            ? "Clarification"
                            : "Ruling"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {errata.errataDate && new Date(errata.errataDate).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {userIsAdmin && (
                        <div className="flex gap-1">
                          <EditErrataDialog errata={errata} cardId={errata.cardId} />
                          <DeleteErrataButton errataId={errata.id} cardId={errata.cardId} />
                        </div>
                      )}
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{errata.details}</ReactMarkdown>
                    </div>
                    {errata.source && (
                      <div className="mt-2 pt-2 border-t">
                        <a
                          href={errata.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Source →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}