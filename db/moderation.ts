import { eq, asc } from "drizzle-orm";
import { db } from "./client";
import { submissions, places, placeTags, cities, categories, tags } from "./schema";
import { slugify } from "../lib/slug";
import { geocodeAddress } from "../lib/geocode";

interface AddPlacePayload {
  name: string;
  type: string;
  address: string;
  tags: string[];
  description: string;
  contact: string;
}

function isAddPlacePayload(payload: unknown): payload is AddPlacePayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  return typeof p.name === "string" && typeof p.address === "string" && Array.isArray(p.tags);
}

export async function getPendingSubmissions() {
  return db.select().from(submissions).where(eq(submissions.status, "pending")).orderBy(asc(submissions.createdAt));
}

async function getOrCreateCategory(label: string) {
  const slug = slugify(label) || "misc";
  const [existing] = await db.select().from(categories).where(eq(categories.slug, slug));
  if (existing) return existing;
  const [created] = await db
    .insert(categories)
    .values({ slug, nameRu: label, nameEs: label, nameEn: label, icon: "pin", sortOrder: 99 })
    .returning();
  return created;
}

async function getOrCreateTag(label: string) {
  const slug = slugify(label);
  if (!slug) return null;
  const [existing] = await db.select().from(tags).where(eq(tags.slug, slug));
  if (existing) return existing;
  const [created] = await db.insert(tags).values({ slug, nameRu: label, nameEs: label, nameEn: label }).returning();
  return created;
}

async function uniqueSlug(base: string): Promise<string> {
  const seed = base || "place";
  let candidate = seed;
  let n = 1;
  // Small table, small candidate set in practice — a loop is fine over a clever query.
  for (;;) {
    const [existing] = await db.select({ id: places.id }).from(places).where(eq(places.slug, candidate));
    if (!existing) return candidate;
    n += 1;
    candidate = `${seed}-${n}`;
  }
}

export type ApproveResult = { ok: true; placeSlug: string } | { ok: false; error: string };

export async function approveSubmission(id: string): Promise<ApproveResult> {
  const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
  if (!submission || submission.status !== "pending" || submission.type !== "add_place") {
    return { ok: false, error: "Заявка не найдена или уже обработана" };
  }
  if (!isAddPlacePayload(submission.payload)) {
    return { ok: false, error: "Некорректные данные заявки" };
  }
  const payload = submission.payload;

  const geo = await geocodeAddress(`${payload.address}, Valencia, Spain`);
  if (!geo) {
    return { ok: false, error: "Не удалось определить координаты по адресу — уточните адрес и попробуйте снова" };
  }

  const [city] = await db.select().from(cities).where(eq(cities.slug, "valencia"));
  if (!city) {
    return { ok: false, error: "Город valencia не найден в БД — запустите npm run db:seed" };
  }

  const category = await getOrCreateCategory(payload.type);
  const slug = await uniqueSlug(slugify(payload.name));

  const [place] = await db
    .insert(places)
    .values({
      cityId: city.id,
      categoryId: category.id,
      slug,
      name: payload.name,
      descriptionRu: payload.description || null,
      address: payload.address,
      lat: geo.lat,
      lng: geo.lng,
      status: "published",
    })
    .returning();

  const tagRows = (await Promise.all(payload.tags.map(getOrCreateTag))).filter(
    (t): t is NonNullable<typeof t> => t !== null
  );
  if (tagRows.length > 0) {
    await db.insert(placeTags).values(tagRows.map((t) => ({ placeId: place.id, tagId: t.id })));
  }

  await db.update(submissions).set({ status: "approved" }).where(eq(submissions.id, id));

  return { ok: true, placeSlug: place.slug };
}

export async function rejectSubmission(id: string): Promise<void> {
  await db.update(submissions).set({ status: "rejected" }).where(eq(submissions.id, id));
}

// A "report_problem" submission has no automated fix — approving it just means "seen,
// will handle manually" (e.g. edit the place directly via Adminer/psql per plan §4.1).
export async function resolveReportProblem(id: string): Promise<void> {
  await db.update(submissions).set({ status: "approved" }).where(eq(submissions.id, id));
}
