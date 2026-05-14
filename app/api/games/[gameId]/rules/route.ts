import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  return NextResponse.json([]);
}
