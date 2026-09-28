import type { Place } from "@/lib/types";
import { PlaceCard } from "@/components/places/place-card";
import { PlaceDetail } from "@/components/places/place-detail";
import { EmptyFilterState, PlaceListSkeleton } from "@/components/places/states";
import { FilterChips } from "@/components/layout/filter-chips";
import { placesCount } from "@/lib/pluralize";

export function Sidebar({
  places,
  allCount,
  loading,
  activeTags,
  onToggleTag,
  selected,
  onSelect,
  onDeselect,
  onResetFilters,
  isFavorite,
  onToggleFavorite,
}: {
  places: Place[];
  allCount: number;
  loading: boolean;
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  selected: Place | null;
  onSelect: (id: string) => void;
  onDeselect: () => void;
  onResetFilters: () => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}) {
  if (selected) {
    return (
      <aside
        className="hidden lg:flex w-[462px] shrink-0 flex-col overflow-y-auto no-scrollbar"
        style={{ borderRight: "1px solid var(--color-border)", background: "var(--color-bg)" }}
      >
        <button
          type="button"
          onClick={onDeselect}
          className="flex items-center gap-2 text-sm font-semibold px-5 pt-5 cursor-pointer w-fit"
          style={{ color: "var(--color-text-secondary)" }}
        >
          ← Ко всем местам
        </button>
        <PlaceDetail
          place={selected}
          favorite={isFavorite(selected.id)}
          onToggleFavorite={() => onToggleFavorite(selected.id)}
        />
      </aside>
    );
  }

  return (
    <aside
      className="hidden lg:flex w-[462px] shrink-0 flex-col"
      style={{ borderRight: "1px solid var(--color-border)", background: "var(--color-bg)" }}
    >
      <div className="px-5.5 pt-4.5 pb-3.5">
        <FilterChips active={activeTags} onToggle={onToggleTag} size="sm" />
      </div>
      <div className="px-5.5 pb-2.5 flex items-baseline justify-between gap-3">
        <span className="text-[15px] font-bold" style={{ color: "var(--color-text)" }}>
          {loading
            ? "Ищем места…"
            : `${placesCount(places.length)}${places.length === allCount ? " в этой области" : ""}`}
        </span>
        <span className="text-sm whitespace-nowrap" style={{ color: "var(--color-text-secondary)" }}>
          Сначала близкие
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-5.5 pb-6">
        {loading ? (
          <div className="pt-2">
            <PlaceListSkeleton />
          </div>
        ) : places.length === 0 ? (
          <EmptyFilterState activeTagCount={activeTags.length} totalCount={allCount} onReset={onResetFilters} />
        ) : (
          <div className="flex flex-col gap-3">
            {places.map((p) => (
              <PlaceCard
                key={p.id}
                place={p}
                onClick={() => onSelect(p.id)}
                favorite={isFavorite(p.id)}
                onToggleFavorite={() => onToggleFavorite(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
