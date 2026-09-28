import { sql } from "drizzle-orm";
import { db } from "./client";
import { VALENCIA_CENTER, haversineMeters } from "../lib/geo";
import { deriveOpenState } from "../lib/derive-hours";
import type { Place, PlaceCategory } from "../lib/types";

interface PlaceRow extends Record<string, unknown> {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  category_label: string;
  district: string | null;
  address: string;
  lat: number;
  lng: number;
  description_ru: string | null;
  opening_hours: { raw?: string } | null;
  instagram: string | null;
  whatsapp: string | null;
  phone: string | null;
  google_maps_url: string | null;
  owner_note: string | null;
  tag_labels: string[] | null;
  photos: string[] | null;
}

function toPlace(row: PlaceRow): Place {
  const { openUntil, isOpenNow } = deriveOpenState(row.opening_hours?.raw);
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category_slug as PlaceCategory,
    categoryLabel: row.category_label,
    district: row.district ?? "",
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    distanceM: Math.round(haversineMeters(VALENCIA_CENTER.lat, VALENCIA_CENTER.lng, row.lat, row.lng)),
    tags: (row.tag_labels ?? []).filter(Boolean),
    description: row.description_ru ?? "",
    hours: row.opening_hours?.raw ?? "",
    openUntil,
    isOpenNow,
    instagram: row.instagram ?? undefined,
    whatsapp: row.whatsapp ?? undefined,
    phone: row.phone ?? undefined,
    googleMapsUrl: row.google_maps_url ?? undefined,
    ownerNote: row.owner_note ? { quote: row.owner_note, author: "" } : undefined,
    photos: row.photos ?? [],
  };
}

const PLACE_SELECT = sql`
  SELECT p.id, p.slug, p.name, cat.slug AS category_slug, cat.name_ru AS category_label,
         p.district, p.address, p.lat, p.lng, p.description_ru, p.opening_hours,
         p.instagram, p.whatsapp, p.phone, p.google_maps_url, p.owner_note, p.photos,
         array_remove(array_agg(t.name_ru), NULL) AS tag_labels
  FROM places p
  JOIN cities city ON city.id = p.city_id
  JOIN categories cat ON cat.id = p.category_id
  LEFT JOIN place_tags pt ON pt.place_id = p.id
  LEFT JOIN tags t ON t.id = pt.tag_id
`;

// No status filter yet — there's no moderation queue to promote drafts to "published"
// yet (valencia-map-project.md §4.1), so every row seeded locally would otherwise be
// invisible. Revisit once the submissions/moderation flow exists.
export async function getPlaces({
  citySlug = "valencia",
  categorySlug = "coffee",
}: { citySlug?: string; categorySlug?: string } = {}): Promise<Place[]> {
  const rows = await db.execute<PlaceRow>(sql`
    ${PLACE_SELECT}
    WHERE city.slug = ${citySlug} AND cat.slug = ${categorySlug}
    GROUP BY p.id, cat.slug, cat.name_ru
    ORDER BY p.name;
  `);
  return rows.map(toPlace);
}

export async function getPlaceBySlug(slug: string): Promise<Place | null> {
  const rows = await db.execute<PlaceRow>(sql`
    ${PLACE_SELECT}
    WHERE p.slug = ${slug}
    GROUP BY p.id, cat.slug, cat.name_ru
    LIMIT 1;
  `);
  return rows[0] ? toPlace(rows[0]) : null;
}
