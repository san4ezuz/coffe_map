import Link from "next/link";
import type { Place } from "@/lib/types";
import { TagBadge } from "@/components/ui/chip";
import { FavoriteButton } from "@/components/ui/favorite-button";

function RouteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 20l6-16 4 10 6-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlaceDetail({
  place,
  onClose,
  showGallery = true,
  showPermalink = true,
  favorite = false,
  onToggleFavorite,
}: {
  place: Place;
  onClose?: () => void;
  showGallery?: boolean;
  /** Link to the place's own SEO page — hide when already rendering on that page. */
  showPermalink?: boolean;
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const mapsHref =
    place.googleMapsUrl ??
    `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`;

  return (
    <div className="flex flex-col">
      {showGallery && (
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            height: 220,
            backgroundImage: place.photos?.[0]
              ? undefined
              : "repeating-linear-gradient(135deg, var(--color-skeleton) 0 7px, var(--color-skeleton-2) 7px 14px)",
          }}
        >
          {place.photos?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary R2 URLs, no fixed remote domain to allowlist
            <img
              src={place.photos?.[0]}
              alt={place.name}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: `${place.coverFocalX ?? 50}% ${place.coverFocalY ?? 50}%` }}
            />
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute top-4 left-4 flex items-center justify-center rounded-full cursor-pointer"
              style={{ width: 40, height: 40, background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              ×
            </button>
          )}
          {onToggleFavorite && (
            <FavoriteButton active={favorite} onClick={onToggleFavorite} size={40} className="absolute right-4 top-4" />
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            <div className="rounded-full" style={{ width: 18, height: 6, background: "var(--color-primary)" }} />
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: "var(--color-text)", opacity: 0.25 }} />
            ))}
          </div>
        </div>
      )}

      <div className="px-5 pb-6 pt-4">
        <div className="font-semibold leading-tight" style={{ fontFamily: "var(--font-spectral)", fontSize: 26, color: "var(--color-text)" }}>
          {place.name}
        </div>
        <div className="text-sm mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
          {place.categoryLabel} · {place.address} · {place.district}
        </div>
        {showPermalink && (
          <Link
            href={`/valencia/coffee/${place.slug}`}
            className="text-[13px] mt-1 inline-block underline"
            style={{ color: "var(--color-primary-strong)" }}
          >
            Страница места
          </Link>
        )}
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {place.tags.map((t) => (
            <TagBadge key={t} label={t} />
          ))}
        </div>
        {(place.photos?.length ?? 0) > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto">
            {place.photos!.slice(1).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element -- arbitrary R2 URLs, no fixed remote domain to allowlist
              <img
                key={url}
                src={url}
                alt={place.name}
                className="shrink-0 rounded-xl object-cover"
                style={{ width: 96, height: 72 }}
              />
            ))}
          </div>
        )}
        <div className="text-[15px] leading-[1.6] mt-3" style={{ color: "var(--color-body-text)" }}>
          {place.description}
        </div>
        <div
          className="flex items-center gap-2.5 mt-3 py-3 flex-wrap"
          style={{ borderTop: "1px solid var(--color-border)", borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="rounded-full"
            style={{ width: 7, height: 7, background: place.isOpenNow ? "var(--color-primary)" : "var(--color-text-secondary)" }}
          />
          <span className="text-[15px] font-bold" style={{ color: "var(--color-text)" }}>
            {place.isOpenNow ? `Открыто до ${place.openUntil}` : "Сейчас закрыто"}
          </span>
          <span className="text-sm" style={{ color: "var(--color-text-secondary)" }}>· {place.hours}</span>
        </div>

        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3.5 h-[54px] rounded-full flex items-center justify-center gap-2 font-bold text-base"
          style={{ background: "var(--color-primary)", color: "#fffdf9" }}
        >
          <RouteIcon /> Построить маршрут
        </a>

        <div className="flex gap-2.5 mt-2">
          {place.instagram && (
            <a
              href={`https://instagram.com/${place.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[52px] rounded-full flex items-center justify-center gap-2 text-[15px] font-semibold"
              style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
            >
              <span style={{ width: 15, height: 15, border: "1.8px solid var(--color-text)", borderRadius: 5, display: "inline-block" }} />
              Instagram
            </a>
          )}
          {place.whatsapp && (
            <a
              href={`https://wa.me/${place.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-[52px] rounded-full flex items-center justify-center gap-2 text-[15px] font-semibold"
              style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
            >
              <span
                style={{
                  width: 15,
                  height: 15,
                  border: "1.8px solid var(--color-text)",
                  borderRadius: "50% 50% 50% 3px",
                  display: "inline-block",
                }}
              />
              WhatsApp
            </a>
          )}
          {place.phone && (
            <a
              href={`tel:${place.phone.replace(/\s+/g, "")}`}
              className="flex-1 h-[52px] rounded-full flex items-center justify-center gap-2 text-[15px] font-semibold"
              style={{ border: "1px solid var(--color-border-strong)", color: "var(--color-text)" }}
            >
              <span style={{ width: 15, height: 15, border: "1.8px solid var(--color-text)", borderRadius: 5, display: "inline-block" }} />
              Позвонить
            </a>
          )}
        </div>

        <Link
          href={`/report/${place.slug}`}
          className="text-[13px] mt-3 inline-block underline"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Сообщить о проблеме
        </Link>

        {place.ownerNote && (
          <div
            className="mt-3.5 rounded-2xl p-3.5 flex gap-3.5"
            style={{ background: "var(--color-surface-2)" }}
          >
            <div
              className="w-12 h-12 shrink-0 rounded-[10px]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(135deg, var(--color-skeleton) 0 5px, var(--color-skeleton-2) 5px 10px)",
              }}
            />
            <div className="min-w-0">
              <div className="font-mono" style={{ fontSize: 10, letterSpacing: 1.2, color: "var(--color-text-secondary)" }}>
                КТО ОТКРЫЛ
              </div>
              <div
                className="italic mt-1.5 leading-[1.45]"
                style={{ fontFamily: "var(--font-spectral)", fontSize: 16, color: "var(--color-text)" }}
              >
                «{place.ownerNote.quote}»
              </div>
              <div className="text-[13px] mt-1.5" style={{ color: "var(--color-text-secondary)" }}>
                {place.ownerNote.author}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
