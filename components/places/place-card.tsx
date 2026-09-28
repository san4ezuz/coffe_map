import type { Place } from "@/lib/types";
import { TagBadge } from "@/components/ui/chip";
import { FavoriteButton } from "@/components/ui/favorite-button";

function formatDistance(m: number) {
  return m < 1000 ? `${m} м` : `${(m / 1000).toFixed(1).replace(".0", "")} км`;
}

export function PlaceCard({
  place,
  selected = false,
  onClick,
  variant = "row",
  favorite = false,
  onToggleFavorite,
}: {
  place: Place;
  selected?: boolean;
  onClick?: () => void;
  variant?: "row" | "column";
  favorite?: boolean;
  onToggleFavorite?: () => void;
}) {
  const isColumn = variant === "column";
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`text-left rounded-2xl cursor-pointer ${isColumn ? "w-[236px] shrink-0" : "flex gap-3.5 w-full p-3"}`}
      style={
        isColumn
          ? undefined
          : {
              background: "var(--color-surface)",
              border: `1.5px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
            }
      }
    >
      <div
        className={`relative ${isColumn ? "h-[118px] rounded-xl" : "w-[104px] h-[104px] shrink-0 rounded-[10px]"}`}
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, var(--color-skeleton) 0 6px, var(--color-skeleton-2) 6px 12px)",
        }}
      >
        {onToggleFavorite && (
          <FavoriteButton
            active={favorite}
            onClick={onToggleFavorite}
            size={30}
            className="absolute top-1.5 right-1.5"
          />
        )}
      </div>
      <div className={isColumn ? "mt-2.5 min-w-0" : "flex-1 min-w-0"}>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-bold truncate" style={{ fontSize: 17, color: "var(--color-text)" }}>
            {place.name}
          </span>
          <span className="text-[13px] shrink-0" style={{ color: "var(--color-text-secondary)" }}>
            {formatDistance(place.distanceM)}
          </span>
        </div>
        <div className="text-[13px] mt-[3px]" style={{ color: "var(--color-text-secondary)" }}>
          {place.categoryLabel} · {place.district}
          {!isColumn && ` · открыто до ${place.openUntil}`}
        </div>
        {!isColumn && (
          <div className="mt-2 text-sm leading-[1.45]" style={{ color: "var(--color-body-text)" }}>
            {place.description}
          </div>
        )}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {place.tags.slice(0, 2).map((t) => (
            <TagBadge key={t} label={t} />
          ))}
        </div>
      </div>
    </div>
  );
}
