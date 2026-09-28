import type { MetadataRoute } from "next";
import { getPlaces } from "@/db/queries";
import { SITE_URL } from "@/lib/site-url";

// Force runtime generation: avoids querying the DB at build time (it may not be
// migrated yet when the platform builds the image) and keeps the sitemap in sync
// with new places without a redeploy.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await getPlaces();

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    ...places.map((p) => ({
      url: `${SITE_URL}/valencia/coffee/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
