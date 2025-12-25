'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type GroupedCard = {
  name: string;
  setCode: string;
  collectorNumber: string;
  image: string;
  quantity: number;
};

export default function CollectionCardsPage() {
  const [cards, setCards] = useState<GroupedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 50;

  const fetchCards = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/collection/cards?page=${pageNumber}&limit=${limit}`
      );
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards);
        setTotal(data.total);
      } else {
        console.error('Failed to fetch cards');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(page);
  }, [page]);

  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages - 1;
  const hasPrevPage = page > 0;

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-6">
        <h1 className="grow text-2xl font-bold">Mes cartes</h1>
        <div className="text-sm text-muted-foreground">
          {total} carte{total > 1 ? 's' : ''} unique{total > 1 ? 's' : ''}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground">
            Vous n'avez pas encore de cartes dans votre collection.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {cards.map((card) => (
              <div
                key={`${card.setCode}-${card.collectorNumber}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative group"
              >
                <div className="relative aspect-[2.5/3.5]">
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm font-semibold">
                    x{card.quantity}
                  </div>
                </div>
                <div className="p-2">
                  <p className="font-semibold text-sm truncate" title={card.name}>
                    {card.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {card.setCode} #{card.collectorNumber}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrevPage}
              >
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} sur {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={!hasNextPage}
              >
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
