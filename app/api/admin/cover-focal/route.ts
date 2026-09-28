import { NextResponse, type NextRequest } from "next/server";
import { updatePlaceCoverFocal } from "@/db/admin-places";

export async function POST(request: NextRequest) {
  const { id, x, y } = (await request.json()) as { id?: string; x?: number; y?: number };

  if (!id || typeof x !== "number" || typeof y !== "number") {
    return NextResponse.json({ error: "id, x and y are required" }, { status: 400 });
  }

  await updatePlaceCoverFocal(id, x, y);
  return NextResponse.json({ ok: true });
}
