"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Errata, ErrataType } from "@/lib/types/errata";
import { BoosterCard } from "@/lib/types/booster";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import DeleteErrataButton from "@/components/DeleteErrataButton";
import EditErrataDialog from "@/components/EditErrataDialog";
import { Search, ArrowUpDown } from "lucide-react";

type ErrataWithCard = {
  errata: Errata;
  card?: BoosterCard;
};

export default function ErratasClientView({
  erratasWithCards,
  userIsAdmin,
}: {
  erratasWithCards: ErrataWithCard[];
  userIsAdmin: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ErrataType | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const filteredAndSortedErratas = useMemo(() => {
    let result = erratasWithCards;

    // Filtrer par nom de carte
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.card?.name?.toLowerCase().includes(query)
      );
    }

    // Filtrer par type
    if (typeFilter !== "all") {
      result = result.filter((item) => item.errata.type === typeFilter);
    }

    // Trier par date d'errata
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.errata.errataDate).getTime();
      const dateB = new Date(b.errata.errataDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [erratasWithCards, searchQuery, typeFilter, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return (
    <>
      {/* Filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par nom de carte..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par type */}
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as ErrataType | "all")}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="errata">Errata</SelectItem>
              <SelectItem value="clarification">Clarification</SelectItem>
              <SelectItem value="ruling">Ruling</SelectItem>
            </SelectContent>
          </Select>

          {/* Bouton de tri */}
          <Button
            variant="outline"
            onClick={toggleSortOrder}
            className="w-full sm:w-auto"
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Date {sortOrder === "desc" ? "↓" : "↑"}
          </Button>
        </div>

        {/* Compteur de résultats */}
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedErratas.length} résultat
          {filteredAndSortedErratas.length > 1 ? "s" : ""}
          {searchQuery || typeFilter !== "all"
            ? ` sur ${erratasWithCards.length}`
            : ""}
        </p>
      </div>

      {/* Liste des erratas */}
      {filteredAndSortedErratas.length === 0 ? (
        <p className="text-muted-foreground">
          Aucun errata ou clarification ne correspond aux critères de recherche.
        </p>
      ) : (
        <div className="space-y-6">
          {filteredAndSortedErratas.map(({ errata, card }) => (
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
                        {new Date(errata.errataDate).toLocaleDateString(
                          "fr-FR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    {userIsAdmin && (
                      <div className="flex gap-1">
                        <EditErrataDialog
                          errata={errata}
                          cardId={errata.cardId}
                        />
                        <DeleteErrataButton
                          errataId={errata.id}
                          cardId={errata.cardId}
                        />
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
          ))}
        </div>
      )}
    </>
  );
}
