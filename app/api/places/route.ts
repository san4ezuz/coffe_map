import { NextRequest, NextResponse } from "next/server";
import { getPlaces } from "@/db/queries";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "valencia";
  const categorySlug = searchParams.get("category") ?? "coffee";

  const places = await getPlaces({ citySlug, categorySlug });
  return NextResponse.json(places);
}
