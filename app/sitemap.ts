import type { MetadataRoute } from "next";
import { getPlaces } from "@/db/queries";
import { SITE_URL } from "@/lib/site-url";

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
