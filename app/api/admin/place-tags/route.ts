import { NextResponse, type NextRequest } from "next/server";
import { attachTagToPlace, createTagAndAttach, detachTagFromPlace } from "@/db/admin-places";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { placeId?: string; tagId?: string; newLabel?: string };
  const { placeId, tagId, newLabel } = body;

  if (!placeId || (!tagId && !newLabel)) {
    return NextResponse.json({ error: "placeId and tagId or newLabel are required" }, { status: 400 });
  }

  if (tagId) {
    await attachTagToPlace(placeId, tagId);
  } else if (newLabel) {
    await createTagAndAttach(placeId, newLabel);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const { placeId, tagId } = (await request.json()) as { placeId?: string; tagId?: string };
  if (!placeId || !tagId) {
    return NextResponse.json({ error: "placeId and tagId are required" }, { status: 400 });
  }
  await detachTagFromPlace(placeId, tagId);
  return NextResponse.json({ ok: true });
}
