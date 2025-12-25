import { auth } from "@/lib/auth";
import { getUserCards } from "@/lib/data/boosters";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "0");
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    const result = await getUserCards({
      userId: session.user.id,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

