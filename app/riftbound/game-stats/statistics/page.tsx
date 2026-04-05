import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getMatches, computeLegendStats } from "@/lib/data/matches";
import LegendStatsView from "@/app/riftbound/game-stats/statistics/LegendStatsView";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function GameStatisticsOverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect("/login");
  }

  const matches = await getMatches(session.user.id);
  const stats = computeLegendStats(matches);

  const totalGames = matches.reduce((sum, m) => sum + m.games.length, 0);
  const totalWins = matches.reduce(
    (sum, m) => sum + m.games.filter((g) => g.result === "win").length,
    0
  );

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Statistiques par légende
          </h1>
          {matches.length > 0 && (
            <p className="text-muted-foreground mt-1 text-sm">
              {matches.length} match{matches.length > 1 ? "s" : ""} · {totalGames} partie{totalGames > 1 ? "s" : ""} · {totalWins} victoire{totalWins > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/riftbound/game-stats">← Retour aux matchs</Link>
        </Button>
      </div>

      <LegendStatsView stats={stats} />
    </div>
  );
}