"use client";

import { useMemo, useState } from "react";
import { Header } from "@/components/layout/header";
import { MobileTopBar } from "@/components/layout/mobile-topbar";
import { FilterChips } from "@/components/layout/filter-chips";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { MapPanel } from "@/components/map/map-panel";
import { useFavorites } from "@/lib/use-favorites";
import type { Place } from "@/lib/types";

function matchesTag(place: Place, tag: string) {
  const t = tag.toLowerCase();
  if (place.categoryLabel.toLowerCase().includes(t)) return true;
  return place.tags.some((pt) => pt.toLowerCase().includes(t) || t.includes(pt.toLowerCase()));
}

function matchesQuery(place: Place, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    place.name.toLowerCase().includes(q) ||
    place.district.toLowerCase().includes(q) ||
    place.tags.some((t) => t.toLowerCase().includes(q)) ||
    place.categoryLabel.toLowerCase().includes(q)
  );
}

export function HomeClient({ initialPlaces }: { initialPlaces: Place[] }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();

  const filtered = useMemo(() => {
    return initialPlaces
      .filter(
        (p) =>
          matchesQuery(p, query) &&
          activeTags.every((tag) => matchesTag(p, tag)) &&
          (!favoritesOnly || isFavorite(p.id))
      )
      .sort((a, b) => a.distanceM - b.distanceM);
  }, [initialPlaces, query, activeTags, favoritesOnly, isFavorite]);

  const selected = filtered.find((p) => p.id === selectedId) ?? null;

  function toggleTag(tag: string) {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function resetFilters() {
    setActiveTags([]);
    setQuery("");
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <Header favoritesOnly={favoritesOnly} onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)} />
      <div className="relative flex flex-1 min-h-0">
        <Sidebar
          places={filtered}
          allCount={initialPlaces.length}
          loading={false}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          selected={selected}
          onSelect={setSelectedId}
          onDeselect={() => setSelectedId(null)}
          onResetFilters={resetFilters}
          isFavorite={isFavorite}
          onToggleFavorite={toggleFavorite}
        />
        <MapPanel places={filtered} selected={selected} onSelectPin={setSelectedId}>
          <MobileTopBar
            query={query}
            onQueryChange={setQuery}
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={() => setFavoritesOnly((v) => !v)}
          />
          {!selected && (
            <FilterChips
              active={activeTags}
              onToggle={toggleTag}
              className="lg:hidden absolute top-[124px] left-3.5 right-0 pr-3.5"
            />
          )}
          <BottomSheet
            places={filtered}
            allCount={initialPlaces.length}
            loading={false}
            selected={selected}
            onSelect={setSelectedId}
            onClose={() => setSelectedId(null)}
            onResetFilters={resetFilters}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
          />
        </MapPanel>
      </div>
    </div>
  );
}
