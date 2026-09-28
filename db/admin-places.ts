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
