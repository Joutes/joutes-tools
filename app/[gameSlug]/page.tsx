import db from "@/lib/mongodb";
import { Game } from "@/lib/types/game";
import Image from "next/image";
import Link from "next/link";
import {
  ChartLineIcon,
  LibraryIcon,
  ScanIcon,
  SearchIcon,
  WatchIcon,
  ArrowRightIcon,
} from "lucide-react";

type GameFeature = {
  title: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const gameFeatures: Record<string, GameFeature[]> = {
  riftbound: [
    {
      title: "Cartes",
      description: "Recherchez et explorez toutes les cartes du jeu.",
      url: "/riftbound/cards",
      icon: SearchIcon,
    },
    {
      title: "Erratas & Rulings",
      description: "Consultez les erratas officiels et rulings de la communauté.",
      url: "/riftbound/erratas",
      icon: LibraryIcon,
    },
    {
      title: "Deck Checker",
      description: "Obtenez des informations utiles et stratégiques sur votre deck.",
      url: "/riftbound/deck-checker",
      icon: ScanIcon,
    },
    {
      title: "Stats de Parties",
      description: "Suivez vos performances et statistiques.",
      url: "/riftbound/game-stats",
      icon: ChartLineIcon,
    },
  ],
  swu: [
    {
      title: "Timers",
      description: "Gérez les rondes et les drafts avec des minuteries dédiées.",
      url: "/swu/timers",
      icon: WatchIcon,
    },
    {
      title: "Deck Checker",
      description: "Vérifiez la légalité de votre deck.",
      url: "/swu/deck-checker",
      icon: ScanIcon,
    },
  ],
};

export default async function GameMainPage({
  params,
}: {
  params: Promise<{ gameSlug: string }>;
}) {
  const { gameSlug } = await params;

  const game = await db.collection<Game>("games").findOne({ slug: gameSlug });

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 gap-4">
        <p className="text-7xl">🐉</p>
        <h1 className="text-4xl font-bold tracking-tight">Hic sunt dracones</h1>
        <p className="text-muted-foreground text-lg max-w-md">
          Ce jeu ne semble pas exister ou ne pas être supporté actuellement par
          la boîte à outils Joutes.
        </p>
        <Link
          href="/"
          className="mt-2 text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const features = gameFeatures[gameSlug] ?? [];

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Hero Banner ── */}
      <div className="relative w-full h-56 md:h-80 overflow-hidden">
        {game.banner ? (
          <Image
            src={game.banner}
            alt={`Bannière ${game.name}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/30 via-primary/10 to-background" />
        )}

        {/* gradient overlay so text stays readable */}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Game identity */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-10 md:pb-8 flex items-end gap-4">
          {game.icon && (
            <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-border shadow-xl shrink-0 bg-card">
              <Image
                src={game.icon}
                alt={`${game.name} icon`}
                fill
                className="object-contain p-1"
              />
            </div>
          )}
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight drop-shadow-sm">
            {game.name}
          </h1>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="container mx-auto px-6 py-8 md:px-10 md:py-10 space-y-12 flex-1">
        {/* Description */}
        {game.description && (
          <section className="max-w-2xl">
            <div className="relative pl-5 border-l-2 border-primary/40">
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                {game.description}
              </p>
            </div>
          </section>
        )}

        {/* Feature cards */}
        {features.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-5 tracking-tight">
              Outils disponibles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {features.map((feature) => (
                <Link
                  key={feature.url}
                  href={feature.url}
                  className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      <feature.icon size={18} />
                    </span>
                    <h3 className="font-semibold text-sm leading-tight">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug flex-1">
                    {feature.description}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Accéder <ArrowRightIcon size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}