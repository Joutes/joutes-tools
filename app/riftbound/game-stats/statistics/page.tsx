import { computeAllLegendStats} from "@/lib/data/matches";
import LegendStatsView from "@/app/riftbound/game-stats/statistics/LegendStatsView";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

export default async function GameStatisticsOverviewPage() {
  const stats = await computeAllLegendStats();

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Statistiques par légende
          </h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/riftbound/game-stats">← Retour aux matchs</Link>
        </Button>
      </div>

      <LegendStatsView stats={stats} />
    </div>
  );
}