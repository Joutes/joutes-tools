import { getErratasByCardId } from "@/lib/data/erratas";
import { isAdmin } from "@/lib/auth-utils";
import meilisearch, { indexes } from "@/lib/meilisearch";
import { BoosterCard } from "@/lib/types/booster";
import AddErrataButton from "./AddErrataButton";
import ReactMarkdown from "react-markdown";
import DeleteErrataButton from "@/components/DeleteErrataButton";

export default async function RiftboundCardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  // Récupérer les informations de la carte depuis Meilisearch
  const index = meilisearch.index<BoosterCard>(indexes.riftbound);
  const card = await index.getDocument(cardId);

  if (!card) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Carte non trouvée</h1>
        <p>La carte avec l'ID {cardId} n'existe pas.</p>
      </div>
    );
  }

  // Récupérer les erratas pour cette carte
  const erratas = await getErratasByCardId(cardId);

  // Vérifier si l'utilisateur est admin
  const userIsAdmin = await isAdmin();

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image de la carte */}
        <div>
          <img
            src={card.image}
            alt={card.name}
            className="w-full rounded-lg shadow-lg"
          />
        </div>

        {/* Détails de la carte */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{card.name}</h1>
          <p className="text-muted-foreground mb-6">
            {card.setCode} #{card.collectorNumber}
          </p>

          {/* Section Erratas/Clarifications/Rulings */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">
                Erratas & Clarifications
              </h2>
              {userIsAdmin && <AddErrataButton cardId={cardId} />}
            </div>

            {erratas.length === 0 ? (
              <p className="text-muted-foreground">
                Aucun errata ou clarification pour cette carte.
              </p>
            ) : (
              <div className="space-y-4">
                {erratas.map((errata) => (
                  <div
                    key={errata.id}
                    className="border rounded-lg p-4 bg-card"
                  >
                    <div className="flex items-center justify-between mb-2">
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
                        <span className="text-xs text-muted-foreground">
                          {new Date(errata.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      {userIsAdmin && (
                        <DeleteErrataButton errataId={errata.id} cardId={cardId} />
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
