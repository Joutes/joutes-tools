import {getBoosters} from "@/lib/data/boosters";
import db from "@/lib/mongodb";
import {Game} from "@/lib/types/game";
import {CreateBoosterDialog} from "./CreateBoosterDialog";
import {headers} from "next/headers";
import {auth} from "@/lib/auth";
import {redirect} from "next/navigation";
import Link from "next/link";

export default async function BoostersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/login');
  }

  const games = await db.collection<Game>("games").find().toArray();
  const boosters = await getBoosters({
    userId: session.user.id,
  });
  
  const gamesFormatted = games.map((game) => ({
    id: game._id.toString(),
    name: game.name,
    icon: game.icon,
    banner: game.banner,
    description: game.description,
    defaultSet: 'OGN',
    defaultBoosterType: 'SET',
  }));

  return (
    <div>
      <div className="flex justify-between items-center gap-4">
        <h1 className="grow">Boosters Page</h1>
        <CreateBoosterDialog games={gamesFormatted}/>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boosters.map((booster) => (
          <Link href={`/collection/boosters/${booster.id}`} key={booster.id}>
            <div key={booster.id} className="border rounded-md p-4">
              <h2 className="text-lg font-semibold mb-2">{booster.setCode} - {booster.lang}</h2>
              <p>Type: {booster.type}</p>
              <p>Cards: {booster.cards.length}</p>
              <p>Price: {booster.value ?? '-'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}