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
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import DeleteErrataButton from "@/components/DeleteErrataButton";
import EditErrataDialog from "@/components/EditErrataDialog";
import ErrataVoteButtons from "@/components/ErrataVoteButtons";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ErratasClientView({
  erratas,
  userCanUpdateErratas,
  userCanVoteErratas,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: {
  erratas: Errata[];
  userCanUpdateErratas: boolean;
  userCanVoteErratas: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ErrataType | "all">("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const filteredAndSortedErratas = useMemo(() => {
    let result = erratas;

    // Filtrer par nom de carte
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        item.card?.name?.toLowerCase().includes(query)
      );
    }

    // Filtrer par type
    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Trier par date d'errata
    result = [...result].sort((a, b) => {
      const dateA = new Date(a.errataDate).getTime();
      const dateB = new Date(b.errataDate).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [erratas, searchQuery, typeFilter, sortOrder]);

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
            ? ` sur ${erratas.length}`
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
          {filteredAndSortedErratas.map((errata) => (
            <div
              key={errata.id}
              className={`border rounded-lg p-6 bg-card shadow-sm ${errata.deprecatedAt ? "opacity-50" : ""}`}
            >
              <div className="flex gap-4">
                {errata.card && (
                  <Link href={`/riftbound/cards/${errata.cardId}`}>
                    <img
                      src={errata.card.image}
                      alt={errata.card.name}
                      className="w-32 h-auto rounded-md hover:shadow-lg transition-shadow cursor-pointer"
                    />
                  </Link>
                )}
                <div className="flex-1">
                  {errata.card && (
                    <Link href={`/riftbound/cards/${errata.cardId}`}>
                      <h3 className="text-xl font-semibold mb-2 hover:underline">
                        {errata.card.name}
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
                    {userCanUpdateErratas && (
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
                  {errata.deprecatedAt && (
                    <span className="inline-block mb-2 text-xs font-semibold px-2 py-0.5 rounded bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      Déprécié
                    </span>
                  )}
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
                  <div className="mt-3 pt-3 border-t flex items-center gap-3">
                    <ErrataVoteButtons
                      errataId={errata.id}
                      votes={errata.votes}
                      userCanVote={userCanVoteErratas}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages} — {totalCount} résultat{totalCount > 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {/* Numéros de pages */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === "…" ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">…</span>
                ) : (
                  <Button
                    key={item}
                    variant={item === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
