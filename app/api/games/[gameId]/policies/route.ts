import {NextRequest, NextResponse} from "next/server";
import {getGameBySlug} from "@/lib/data/games";
import {requirePermission} from "@/lib/permissions";
import {countAllPolicies, getAllPolicies} from "@/lib/data/policies";
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

export async function GET(request: NextRequest, {params}: { params: Promise<{ gameId: string }> }) {
  const {gameId} = await params;

  const session = await auth.api.getSession({headers: await headers()});
  const userId = session?.user?.id;

  const game = await getGameBySlug(gameId);

  if (!game) {
    return NextResponse.json({error: "Game not found"}, {status: 404});
  }

  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get('searchQuery') || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  const offset = (page - 1) * limit;

  const [policies, totalCount] = await Promise.all([
    getAllPolicies({gameId: game._id.toString(), offset, limit, userId, search, sortOrder: 'asc'}),
    countAllPolicies({gameId: game._id.toString(), search}),
  ]);

  return NextResponse.json(policies, {
    headers: {
      'x-page': page.toString(),
      'x-page-size': limit.toString(),
      'x-count': totalCount.toString(),
    },
  });
}

export async function POST(request: NextRequest, {params}: { params: Promise<{ gameId: string }> }) {
  const {gameId} = await params;

  const game = await getGameBySlug(gameId);

  if (!game) {
    return NextResponse.json({error: "Game not found"}, {status: 404});
  }

  await requirePermission('policies:update');

  return NextResponse.json({});
}
