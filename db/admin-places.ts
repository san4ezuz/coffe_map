import { asc, eq } from "drizzle-orm";
import { db } from "./client";
import { places } from "./schema";

export async function getAllPlacesForAdmin() {
  return db
    .select({
      id: places.id,
      slug: places.slug,
      name: places.name,
      descriptionRu: places.descriptionRu,
      status: places.status,
      photos: places.photos,
      coverFocalX: places.coverFocalX,
      coverFocalY: places.coverFocalY,
    })
    .from(places)
    .orderBy(asc(places.name));
}

export async function updatePlaceAdmin(id: string, data: { descriptionRu: string }): Promise<void> {
  await db
    .update(places)
    .set({ descriptionRu: data.descriptionRu || null, updatedAt: new Date() })
    .where(eq(places.id, id));
}

async function getPhotos(id: string): Promise<string[]> {
  const [row] = await db.select({ photos: places.photos }).from(places).where(eq(places.id, id));
  return Array.isArray(row?.photos) ? (row.photos as string[]) : [];
}

export async function addPlacePhoto(id: string, url: string): Promise<void> {
  const photos = await getPhotos(id);
  await db
    .update(places)
    .set({ photos: [...photos, url], updatedAt: new Date() })
    .where(eq(places.id, id));
}

export async function removePlacePhoto(id: string, url: string): Promise<void> {
  const photos = await getPhotos(id);
  await db
    .update(places)
    .set({ photos: photos.filter((p) => p !== url), updatedAt: new Date() })
    .where(eq(places.id, id));
}

export async function updatePlaceCoverFocal(id: string, x: number, y: number): Promise<void> {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  await db
    .update(places)
    .set({ coverFocalX: clamp(x), coverFocalY: clamp(y), updatedAt: new Date() })
    .where(eq(places.id, id));
}
