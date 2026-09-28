import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  doublePrecision,
  jsonb,
  boolean,
  timestamp,
  integer,
  primaryKey,
  index,
  customType,
} from "drizzle-orm/pg-core";

// PostGIS geography column. Populated automatically from lat/lng by Postgres (see
// `.generatedAlwaysAs` below) so application code only ever writes plain numbers —
// the geography value exists purely so `<->`/ST_Distance "nearest" queries (plan §7)
// can use the GiST index instead of scanning + computing haversine in SQL by hand.
// Untyped "geography" (no Point/4326 typmod) — drizzle-kit's SQL generator quotes any
// dataType() string containing "(" or "," as a bare identifier, which Postgres then
// rejects as an unknown type. ST_SetSRID(...) below always produces SRID 4326 points
// regardless, so the typmod isn't needed for correctness.
const geography = customType<{ data: string }>({
  dataType() {
    return "geography";
  },
});

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEs: text("name_es").notNull(),
  centerLat: doublePrecision("center_lat").notNull(),
  centerLng: doublePrecision("center_lng").notNull(),
  defaultZoom: doublePrecision("default_zoom").notNull().default(13),
  themeBg: text("theme_bg").notNull(),
  themeSurface: text("theme_surface").notNull(),
  themePrimary: text("theme_primary").notNull(),
  themeText: text("theme_text").notNull(),
  themeTextSecondary: text("theme_text_secondary").notNull(),
  themeDarkBg: text("theme_dark_bg").notNull(),
  themeDarkSurface: text("theme_dark_surface").notNull(),
  themeDarkPrimary: text("theme_dark_primary").notNull(),
  themeDarkText: text("theme_dark_text").notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  icon: text("icon").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameRu: text("name_ru").notNull(),
  nameEs: text("name_es").notNull(),
  nameEn: text("name_en").notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
});

export const placeStatusValues = ["draft", "published", "closed", "hidden"] as const;
export type PlaceStatus = (typeof placeStatusValues)[number];

export const places = pgTable(
  "places",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    nameOriginal: text("name_original"),
    descriptionRu: text("description_ru"),
    descriptionEs: text("description_es"),
    descriptionEn: text("description_en"),
    address: text("address").notNull(),
    district: text("district"),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    location: geography("location").generatedAlwaysAs(
      () => sql`ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography`
    ),
    phone: text("phone"),
    whatsapp: text("whatsapp"),
    website: text("website"),
    instagram: text("instagram"),
    telegram: text("telegram"),
    googleMapsUrl: text("google_maps_url"),
    openingHours: jsonb("opening_hours"),
    photos: jsonb("photos").notNull().default([]),
    // Focal point (percent, 0-100) for cropping photos[0] in card/gallery thumbnails —
    // CSS object-position. Defaults to center.
    coverFocalX: doublePrecision("cover_focal_x").notNull().default(50),
    coverFocalY: doublePrecision("cover_focal_y").notNull().default(50),
    ownerNote: text("owner_note"),
    languages: text("languages").array().notNull().default(sql`ARRAY[]::text[]`),
    status: text("status", { enum: placeStatusValues }).notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    featuredUntil: timestamp("featured_until", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
  },
  (table) => [
    index("places_location_gist").using("gist", table.location),
    index("places_city_status_idx").on(table.cityId, table.status),
  ]
);

export const placeTags = pgTable(
  "place_tags",
  {
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.placeId, table.tagId] })]
);

export const submissionTypeValues = ["add_place", "report_problem"] as const;
export const submissionStatusValues = ["pending", "approved", "rejected"] as const;

export const submissions = pgTable("submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", { enum: submissionTypeValues }).notNull(),
  payload: jsonb("payload").notNull(),
  source: text("source"),
  tgUserId: text("tg_user_id"),
  status: text("status", { enum: submissionStatusValues }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const placeViews = pgTable(
  "place_views",
  {
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    day: text("day").notNull(), // YYYY-MM-DD; a plain date/day bucket, not a timestamp
    count: integer("count").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.placeId, table.day] })]
);
