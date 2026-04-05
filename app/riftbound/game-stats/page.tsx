import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMatches } from "@/lib/data/matches";
import AddMatchDialog from "@/app/riftbound/game-stats/AddMatchDialog";
import MatchesList from "@/app/riftbound/game-stats/MatchesList";
import { Trophy, Sword, BarChart3 } from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default async function RiftboundGameStatsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const matches = await getMatches(session.user.id);

  const totalMatches = matches.length;
  const matchWins = matches.filter(
    (m) =>
      m.games.filter((g) => g.result === "win").length >
      m.games.filter((g) => g.result === "loss").length
  ).length;
  const matchLosses = matches.filter(
    (m) =>
      m.games.filter((g) => g.result === "loss").length >
      m.games.filter((g) => g.result === "win").length
  ).length;
  const winRate =
    totalMatches > 0 ? Math.round((matchWins / totalMatches) * 100) : 0;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h1 className="text-3xl font-bold">Statistiques de parties</h1>
        <div className="flex gap-2">
          {matches.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/riftbound/game-stats/statistics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats par légende
              </Link>
            </Button>
          )}
          <AddMatchDialog />
        </div>
      </div>

      {/* Stats globales */}
      {totalMatches > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="border rounded-lg p-4 bg-card text-center">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
            <div className="text-2xl font-bold">{totalMatches}</div>
            <div className="text-xs text-muted-foreground">Matchs joués</div>
          </div>
          <div className="border rounded-lg p-4 bg-card text-center">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{matchWins}</div>
            <div className="text-xs text-muted-foreground">Victoires</div>
          </div>
          <div className="border rounded-lg p-4 bg-card text-center">
            <Sword className="h-5 w-5 mx-auto mb-1 text-red-500" />
            <div className="text-2xl font-bold text-red-500">{matchLosses}</div>
            <div className="text-xs text-muted-foreground">Défaites</div>
          </div>
          <div className="border rounded-lg p-4 bg-card text-center">
            <div className="text-2xl font-bold">{winRate}%</div>
            <div className="text-xs text-muted-foreground">Taux de victoire</div>
          </div>
        </div>
      )}

      <MatchesList matches={matches} />
    </div>
  );
}
