"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

type Game = {
  id: string;
  name: string;
  icon?: string | null;
};

export function GameFilter({ games }: { games: Game[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGameId = searchParams.get('gameId');

  const handleGameChange = (gameId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (gameId === 'all') {
      params.delete('gameId');
    } else {
      params.set('gameId', gameId);
    }
    params.delete('page'); // Reset to page 1 when changing filter
    
    const query = params.toString();
    router.push(`/collection/boosters${query ? `?${query}` : ''}`);
  };

  const handleClearFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('gameId');
    params.delete('page');
    
    const query = params.toString();
    router.push(`/collection/boosters${query ? `?${query}` : ''}`);
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentGameId || 'all'}
        onValueChange={handleGameChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Tous les jeux" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les jeux</SelectItem>
          {games.map((game) => (
            <SelectItem key={game.id} value={game.id}>
              <div className="flex items-center gap-2">
                {game.icon && (
                  <img src={game.icon} alt="" className="size-4" />
                )}
                {game.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {currentGameId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilter}
        >
          Effacer le filtre
        </Button>
      )}
    </div>
  );
}
