import { NextResponse, type NextRequest } from "next/server";
import { addPlacePhoto, removePlacePhoto } from "@/db/admin-places";
import { uploadPlacePhoto, deletePlacePhoto } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const id = formData.get("id");
  const file = formData.get("photo");

  if (typeof id !== "string" || !id || !(file instanceof File)) {
    return NextResponse.json({ error: "id and photo are required" }, { status: 400 });
  }

  try {
    const url = await uploadPlacePhoto(id, file);
    await addPlacePhoto(id, url);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const { id, url } = (await request.json()) as { id?: string; url?: string };

  if (!id || !url) {
    return NextResponse.json({ error: "id and url are required" }, { status: 400 });
  }

  try {
    await deletePlacePhoto(url);
    await removePlacePhoto(id, url);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
