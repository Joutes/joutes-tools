import { getErratasByCardId } from "@/lib/data/erratas";
import { isAdmin } from "@/lib/auth-utils";
import { BoosterCard } from "@/lib/types/booster";
import AddErrataButton from "./AddErrataButton";
import BanCardButton from "./BanCardButton";
import ReactMarkdown from "react-markdown";
import DeleteErrataButton from "@/components/DeleteErrataButton";
import EditErrataDialog from "@/components/EditErrataDialog";
import ErrataVoteButtons from "@/components/ErrataVoteButtons";
import CardSearchBar from "./CardSearchBar";
import db from "@/lib/mongodb";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { hasPermission } from "@/lib/permissions";
import { Metadata } from "next/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cardId: string }>;
}): Promise<Metadata> {
  const { cardId } = await params;

  // Récupérer les informations de la carte depuis MongoDB
  const card = await db.collection<BoosterCard>("cards").findOne({ id: cardId });

  if (!card) {
    return {
      title: 'Carte non trouvée',
    };
  }

  return {
    title: `${card.name} - Détails et erratas officiels`,
    description: `Découvrez les détails de ${card.name}, y compris les erratas officiels et les clarifications de la communauté.`,
    openGraph: {
      title: `${card.name} - Détails et erratas officiels`,
      description: `Découvrez les détails de ${card.name}, y compris les erratas officiels et les clarifications de la communauté.`,
      images: [card.image],
    },
  };
}

export default async function RiftboundCardDetailPage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  // Récupérer les informations de la carte depuis MongoDB
  const card = await db.collection<BoosterCard>("cards").findOne({ id: cardId });

  if (!card) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Carte non trouvée</h1>
        <p>La carte avec l'ID {cardId} n'existe pas.</p>
      </div>
    );
  }

  // Récupérer les erratas pour cette carte (avec votes)
  const erratas = await getErratasByCardId(cardId, userId);

  // Vérifier si l'utilisateur est admin
  const userIsAdmin = await isAdmin();
  const userCanVoteErratas = await hasPermission('erratas:vote');

  return (
    <div className="container mx-auto p-6">
      {/* Barre de recherche */}
      <div className="mb-8 flex justify-center">
        <CardSearchBar />
      </div>

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
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h1 className="text-3xl font-bold">{card.name}</h1>
            {card.banned && (
              <span className="bg-red-600 text-white text-sm font-semibold px-2 py-1 rounded">
                Banned
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              {card.setCode} #{card.collectorNumber}
            </p>
            {userIsAdmin && (
              <BanCardButton cardId={cardId} banned={card.banned} />
            )}
          </div>

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
                    className={`border rounded-lg p-4 bg-card ${errata.deprecatedAt ? "opacity-50" : ""}`}
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
                          {new Date(errata.errataDate).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {userIsAdmin && (
                        <div className="flex gap-1">
                          <EditErrataDialog errata={errata} cardId={cardId} />
                          <DeleteErrataButton errataId={errata.id} cardId={cardId} />
                        </div>
                      )}
                    </div>
                    {errata.deprecatedAt && (
                      <span className="inline-block mb-2 text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        Déprécié
                      </span>
                    )}
                    <div className="prose prose-sm dark:prose-invert max-w-none ">
                      <ReactMarkdown children={errata.details} />
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
                    {errata.deprecatedAt && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground italic">
                          Déprécié le{" "}
                          {new Date(errata.deprecatedAt).toLocaleDateString("fr-FR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t">
                      <ErrataVoteButtons
                        errataId={errata.id}
                        votes={errata.votes}
                        userCanVote={userCanVoteErratas}
                      />
                    </div>
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
