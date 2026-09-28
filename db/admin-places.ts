import { and, asc, eq } from "drizzle-orm";
import { db } from "./client";
import { places, tags, placeTags, cities, categories } from "./schema";
import { slugify } from "../lib/slug";
import type { ImportRow } from "../lib/import-places";

export async function getAllPlacesForAdmin() {
  const rows = await db
    .select({
      id: places.id,
      slug: places.slug,
      name: places.name,
      descriptionRu: places.descriptionRu,
      status: places.status,
      photos: places.photos,
      coverFocalX: places.coverFocalX,
      coverFocalY: places.coverFocalY,
      tagId: tags.id,
      tagLabel: tags.nameRu,
    })
    .from(places)
    .leftJoin(placeTags, eq(placeTags.placeId, places.id))
    .leftJoin(tags, eq(tags.id, placeTags.tagId))
    .orderBy(asc(places.name));

  const result: {
    id: string;
    slug: string;
    name: string;
    descriptionRu: string | null;
    status: string;
    photos: unknown;
    coverFocalX: number;
    coverFocalY: number;
    tags: { id: string; label: string }[];
  }[] = [];
  const indexById = new Map<string, number>();

  for (const row of rows) {
    let idx = indexById.get(row.id);
    if (idx === undefined) {
      idx = result.length;
      indexById.set(row.id, idx);
      result.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        descriptionRu: row.descriptionRu,
        status: row.status,
        photos: row.photos,
        coverFocalX: row.coverFocalX,
        coverFocalY: row.coverFocalY,
        tags: [],
      });
    }
    if (row.tagId && row.tagLabel) {
      result[idx].tags.push({ id: row.tagId, label: row.tagLabel });
    }
  }

  return result;
}

export async function getAllTags() {
  return db.select({ id: tags.id, label: tags.nameRu }).from(tags).orderBy(asc(tags.nameRu));
}

export async function attachTagToPlace(placeId: string, tagId: string): Promise<void> {
  await db.insert(placeTags).values({ placeId, tagId }).onConflictDoNothing();
}

export async function createTagAndAttach(placeId: string, label: string): Promise<void> {
  const trimmed = label.trim();
  if (!trimmed) return;
  const slug = slugify(trimmed);
  const [tag] = await db
    .insert(tags)
    .values({ slug, nameRu: trimmed, nameEs: trimmed, nameEn: trimmed })
    .onConflictDoUpdate({ target: tags.slug, set: { nameRu: trimmed } })
    .returning({ id: tags.id });
  await attachTagToPlace(placeId, tag.id);
}

export async function detachTagFromPlace(placeId: string, tagId: string): Promise<void> {
  await db.delete(placeTags).where(and(eq(placeTags.placeId, placeId), eq(placeTags.tagId, tagId)));
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

export async function importPlaces(
  rows: ImportRow[]
): Promise<{ created: string[]; updated: string[]; errors: { row: ImportRow; message: string }[] }> {
  const created: string[] = [];
  const updated: string[] = [];
  const errors: { row: ImportRow; message: string }[] = [];

  const [city] = await db.select({ id: cities.id }).from(cities).where(eq(cities.slug, "valencia"));
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, "coffee"));
  if (!city || !category) {
    throw new Error("Город/категория не найдены в БД — сначала выполните db:seed хотя бы раз.");
  }

  const usedSlugs = new Set<string>();

  for (const row of rows) {
    let slug = slugify(row.name);
    while (usedSlugs.has(slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    usedSlugs.add(slug);

    try {
      const [existing] = await db.select({ id: places.id }).from(places).where(eq(places.slug, slug));

      const [placeRow] = await db
        .insert(places)
        .values({
          cityId: city.id,
          categoryId: category.id,
          slug,
          name: row.name,
          descriptionRu: row.description ?? null,
          address: row.address,
          district: row.district ?? null,
          lat: row.lat,
          lng: row.lng,
          phone: row.phone ?? null,
          whatsapp: row.whatsapp ?? null,
          instagram: row.instagram ?? null,
          googleMapsUrl: row.googleMapsUrl ?? null,
          openingHours: row.hours ? { raw: row.hours } : null,
          status: "published",
        })
        .onConflictDoUpdate({
          target: places.slug,
          set: {
            name: row.name,
            descriptionRu: row.description ?? null,
            address: row.address,
            district: row.district ?? null,
            lat: row.lat,
            lng: row.lng,
            phone: row.phone ?? null,
            whatsapp: row.whatsapp ?? null,
            instagram: row.instagram ?? null,
            googleMapsUrl: row.googleMapsUrl ?? null,
            openingHours: row.hours ? { raw: row.hours } : null,
            updatedAt: new Date(),
          },
        })
        .returning({ id: places.id });

      if (row.tags.length > 0) {
        await db.delete(placeTags).where(eq(placeTags.placeId, placeRow.id));
        for (const label of row.tags) {
          const tagSlug = slugify(label);
          const [tag] = await db
            .insert(tags)
            .values({ slug: tagSlug, nameRu: label, nameEs: label, nameEn: label })
            .onConflictDoUpdate({ target: tags.slug, set: { nameRu: label } })
            .returning({ id: tags.id });
          await db.insert(placeTags).values({ placeId: placeRow.id, tagId: tag.id }).onConflictDoNothing();
        }
      }

      if (existing) updated.push(row.name);
      else created.push(row.name);
    } catch (err) {
      errors.push({ row, message: err instanceof Error ? err.message : "Неизвестная ошибка" });
    }
  }

  return { created, updated, errors };
}

export async function updatePlaceCoverFocal(id: string, x: number, y: number): Promise<void> {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  await db
    .update(places)
    .set({ coverFocalX: clamp(x), coverFocalY: clamp(y), updatedAt: new Date() })
    .where(eq(places.id, id));
}
