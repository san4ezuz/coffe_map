import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "./client";
import { cities, categories, tags, places, placeTags } from "./schema";
import { PLACES } from "../lib/places-data";
import { slugify } from "../lib/slug";

// Palette from valencia-map-project.md §7.1.
const VALENCIA = {
  slug: "valencia",
  nameRu: "Валенсия",
  nameEs: "Valencia",
  centerLat: 39.4699,
  centerLng: -0.3763,
  defaultZoom: 13,
  themeBg: "#FAF3E9",
  themeSurface: "#FFFDF9",
  themePrimary: "#E8622C",
  themeText: "#2B2420",
  themeTextSecondary: "#8A7A6D",
  themeDarkBg: "#1C1712",
  themeDarkSurface: "#2A231D",
  themeDarkPrimary: "#F0855A",
  themeDarkText: "#F5EDE1",
};

const COFFEE_CATEGORY = { slug: "coffee", nameRu: "Кофейня", nameEs: "Cafetería", nameEn: "Coffee shop", icon: "coffee" };

async function main() {
  const [city] = await db
    .insert(cities)
    .values(VALENCIA)
    .onConflictDoUpdate({ target: cities.slug, set: VALENCIA })
    .returning();

  const [category] = await db
    .insert(categories)
    .values({ ...COFFEE_CATEGORY, sortOrder: 0 })
    .onConflictDoUpdate({ target: categories.slug, set: COFFEE_CATEGORY })
    .returning();

  const tagLabels = [...new Set(PLACES.flatMap((p) => p.tags))];
  const tagIdByLabel = new Map<string, string>();
  for (const label of tagLabels) {
    const slug = slugify(label);
    const [row] = await db
      .insert(tags)
      .values({ slug, nameRu: label, nameEs: label, nameEn: label })
      .onConflictDoUpdate({ target: tags.slug, set: { nameRu: label } })
      .returning();
    tagIdByLabel.set(label, row.id);
  }

  for (const p of PLACES) {
    const [row] = await db
      .insert(places)
      .values({
        cityId: city.id,
        categoryId: category.id,
        slug: p.slug,
        name: p.name,
        descriptionRu: p.description,
        address: p.address,
        district: p.district,
        lat: p.lat,
        lng: p.lng,
        phone: p.phone,
        instagram: p.instagram,
        whatsapp: p.whatsapp,
        googleMapsUrl: p.googleMapsUrl,
        openingHours: { raw: p.hours },
        status: "draft",
      })
      .onConflictDoUpdate({
        target: places.slug,
        set: {
          name: p.name,
          descriptionRu: p.description,
          address: p.address,
          district: p.district,
          lat: p.lat,
          lng: p.lng,
          updatedAt: new Date(),
        },
      })
      .returning();

    await db.delete(placeTags).where(eq(placeTags.placeId, row.id));
    if (p.tags.length > 0) {
      await db.insert(placeTags).values(p.tags.map((t) => ({ placeId: row.id, tagId: tagIdByLabel.get(t)! })));
    }
  }

  console.log(`Seeded: 1 city, 1 category, ${tagLabels.length} tags, ${PLACES.length} places.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
