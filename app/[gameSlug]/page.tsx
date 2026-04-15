import db from "@/lib/mongodb";
import {Game} from "@/lib/types/game";

export default async function GameMainPage({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params;

  const game = await db.collection<Game>('games').findOne({
    slug: gameSlug,
  });

  console.log(game);

  if (!game) {
    return (
      <div>
        <h1 className="text-4xl">Hic sunt dracones</h1>
        <p>Ce jeu ne semble pas exister ou ne pas être supporté actuellement par la boîte à outils Joutes.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>{game.name}</h1>
    </div>
  );
}