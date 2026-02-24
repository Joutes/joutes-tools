import {getBoosters, countBoosters} from "@/lib/data/boosters";
import db from "@/lib/mongodb";
import {Game} from "@/lib/types/game";
import {CreateBoosterDialog} from "./CreateBoosterDialog";
import {GameFilter} from "./GameFilter";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import Link from "next/link";
import {Button} from "@/components/ui/button";

type SearchParams = Promise<{
  gameId?: string;
  page?: string;
}>;

export default async function BoostersPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  const gameId = searchParams.gameId;
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;

  const games = await db.collection<Game>("games").find().toArray();
  
  const [boosters, totalCount] = await Promise.all([
    getBoosters({
      userId: session.user.id,
      gameId: gameId,
      page: page - 1,
      limit: limit,
    }),
    countBoosters({
      userId: session.user.id,
      gameId: gameId,
    }),
  ]);
  
  const gamesFormatted = games.map((game) => ({
    id: game._id.toString(),
    name: game.name,
    icon: game.icon,
    banner: game.banner,
    description: game.description,
    defaultSet: 'OGN',
    defaultBoosterType: 'SET',
  }));

  const totalPages = Math.ceil(totalCount / limit);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  // Helper to build pagination URLs
  const buildPageUrl = (newPage: number) => {
    const params = new URLSearchParams();
    if (gameId) params.set('gameId', gameId);
    params.set('page', newPage.toString());
    return `/collection/boosters?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <h1 className="grow">Boosters Page</h1>
        <CreateBoosterDialog games={gamesFormatted}/>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <GameFilter games={gamesFormatted} />
        {gameId && (
          <p className="text-sm text-muted-foreground">
            {totalCount} booster{totalCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {boosters.length === 0 ? (
        <div className="mt-8 text-center text-muted-foreground">
          <p>Aucun booster trouvé</p>
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boosters.map((booster) => (
              <Link href={`/collection/boosters/${booster.id}`} key={booster.id}>
                <div className="border rounded-md p-4 hover:bg-accent transition-colors">
                  <h2 className="text-lg font-semibold mb-2">{booster.setCode} - {booster.lang}</h2>
                  <p>Type: {booster.type}</p>
                  <p>Cards: {booster.cards.length}</p>
                  <p>Price: {booster.value ?? '-'}</p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                asChild
                variant="outline"
                disabled={!hasPrevious}
              >
                {hasPrevious ? (
                  <Link href={buildPageUrl(page - 1)}>Précédent</Link>
                ) : (
                  <span>Précédent</span>
                )}
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    asChild={p !== page}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    disabled={p === page}
                  >
                    {p === page ? (
                      <span>{p}</span>
                    ) : (
                      <Link href={buildPageUrl(p)}>{p}</Link>
                    )}
                  </Button>
                ))}
              </div>

              <Button
                asChild
                variant="outline"
                disabled={!hasNext}
              >
                {hasNext ? (
                  <Link href={buildPageUrl(page + 1)}>Suivant</Link>
                ) : (
                  <span>Suivant</span>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}