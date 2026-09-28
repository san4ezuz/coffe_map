import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlaceBySlug } from "@/db/queries";
import { ReportProblemForm } from "@/components/report-problem/form";

export const revalidate = 0;

export default async function ReportProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = await getPlaceBySlug(slug);
  if (!place) notFound();

  return (
    <div className="flex flex-1 min-h-0 items-center justify-center" style={{ background: "var(--color-bg)" }}>
      <div
        className="w-full h-full lg:h-[640px] lg:max-w-[440px] lg:rounded-[32px] lg:border overflow-hidden flex flex-col"
        style={{ background: "var(--color-bg)", borderColor: "var(--color-border-strong)" }}
      >
        <div className="flex items-center justify-between px-5 pt-6 shrink-0">
          <Link
            href={`/valencia/coffee/${place.slug}`}
            aria-label="Закрыть"
            className="w-10 h-10 rounded-full flex items-center justify-center text-base"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
          >
            ×
          </Link>
        </div>
        <div className="px-5 pt-4 shrink-0">
          <div className="font-semibold leading-tight" style={{ fontFamily: "var(--font-spectral)", fontSize: 24, color: "var(--color-text)" }}>
            Сообщить о проблеме
          </div>
          <div className="text-[15px] mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
            {place.name}
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ReportProblemForm place={place} />
        </div>
      </div>
    </div>
  );
}
