import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPlaceBySlug } from "@/db/queries";
import { PlaceDetail } from "@/components/places/place-detail";

// Data still changes by direct DB edits (no moderation UI yet), so skip ISR caching
// for now — see the same note on app/page.tsx. Revisit once the catalog stabilizes.
// Fully dynamic (no generateStaticParams): avoids querying the DB at build time
// (the DB may not be migrated yet when the platform builds the image) and means
// new places show up immediately without a redeploy.
export const revalidate = 0;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) return {};

  const title = `${place.name} — ${place.categoryLabel.toLowerCase()} в Валенсии | Mesta`;
  const description = `${place.name} на Mesta: ${place.address}, ${place.district}. ${place.description}`;

  return {
    title,
    description,
    alternates: { canonical: `/valencia/coffee/${place.slug}` },
    openGraph: { title, description, type: "article" },
  };
}

export default async function PlacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="max-w-[640px] w-full mx-auto py-6 px-4">
        <Link href="/" className="text-sm underline" style={{ color: "var(--color-text-secondary)" }}>
          ← На карту
        </Link>
        <div className="mt-4 rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
          <PlaceDetail place={place} showPermalink={false} />
        </div>
      </div>
    </div>
  );
}
