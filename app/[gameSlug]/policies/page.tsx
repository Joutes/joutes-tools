import { getAllPolicies, countAllPolicies } from "@/lib/data/policies";
import AddPolicyDialog from "./AddPolicyDialog";
import PoliciesClientView from "./PoliciesClientView";
import { hasPermission } from "@/lib/permissions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import db from "@/lib/mongodb";
import { Game } from "@/lib/types/game";
import { notFound } from "next/navigation";
import { Metadata } from "next/types";

const PAGE_SIZE = 20;

export async function generateMetadata({
  params
}: {
  params: Promise<{ gameSlug: string }>
}): Promise<Metadata> {
  const { gameSlug } = await params;
  const game = await db.collection<Game>("games").findOne({ slug: gameSlug });

  if (!game) {
    return {
      title: 'Jeu non trouvé',
    };
  }

  return {
    title: `Précis de règles et policies pour ${game.name}`,
    description: `Explorez les règles et les policies pour ${game.name}.`,
    openGraph: {
      title: `Précis de règles et policies pour ${game.name}`,
      description: `Explorez les règles et les policies pour ${game.name}.`,
      images: game.banner ? [game.banner] : [],
    },
  };
}

export default async function GamePoliciesPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameSlug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { gameSlug } = await params;

  const game = await db.collection<Game>("games").findOne({ slug: gameSlug });
  if (!game) notFound();

  const gameId = game._id.toString();

  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;

  const { page: pageParam } = await searchParams;
  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const [policies, totalCount, userCanUpdatePolicies, userCanVotePolicies] = await Promise.all([
    getAllPolicies({ gameId, userId, offset, limit: PAGE_SIZE }),
    countAllPolicies({ gameId }),
    hasPermission("policies:update"),
    hasPermission("policies:vote"),
  ]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Rule Policies — {game.name}</h1>
        {userCanUpdatePolicies && <AddPolicyDialog gameId={gameId} gameSlug={gameSlug} />}
      </div>

      <PoliciesClientView
        initialPolicies={policies}
        initialTotalCount={totalCount}
        initialPage={currentPage}
        pageSize={PAGE_SIZE}
        gameId={gameId}
        gameSlug={gameSlug}
        userCanUpdatePolicies={userCanUpdatePolicies}
        userCanVotePolicies={userCanVotePolicies}
      />
    </div>
  );
}