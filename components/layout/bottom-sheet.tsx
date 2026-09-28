"use client";

import { useState } from "react";
import type { Place } from "@/lib/types";
import { PlaceCard } from "@/components/places/place-card";
import { PlaceDetail } from "@/components/places/place-detail";
import { EmptyFilterState, PlaceListSkeleton } from "@/components/places/states";
import { placesCount } from "@/lib/pluralize";

export function BottomSheet({
  places,
  allCount,
  loading,
  selected,
  onSelect,
  onClose,
  onResetFilters,
  isFavorite,
  onToggleFavorite,
}: {
  places: Place[];
  allCount: number;
  loading: boolean;
  selected: Place | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  onResetFilters: () => void;
  isFavorite: (id: string) => boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const [listView, setListView] = useState(false);

  if (selected) {
    return (
      <div
        className="lg:hidden absolute bottom-0 left-0 right-0 rounded-t-[26px] overflow-y-auto no-scrollbar"
        style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)", maxHeight: "72%" }}
      >
        <div className="pt-2.5 pb-1 sticky top-0" style={{ background: "var(--color-surface)" }}>
          <div className="w-[42px] h-1 rounded-full mx-auto" style={{ background: "var(--color-border-strong)" }} />
        </div>
        <PlaceDetail
          place={selected}
          onClose={onClose}
          favorite={isFavorite(selected.id)}
          onToggleFavorite={() => onToggleFavorite(selected.id)}
        />
      </div>
    );
  }

  return (
    <div
      className="lg:hidden absolute bottom-0 left-0 right-0 rounded-t-[26px] overflow-hidden"
      style={{ background: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}
    >
      <div className="pt-2.5">
        <div className="w-[42px] h-1 rounded-full mx-auto" style={{ background: "var(--color-border-strong)" }} />
      </div>
      <div className="flex items-baseline justify-between px-5 pt-3.5 pb-3">
        <span className="font-bold text-base" style={{ color: "var(--color-text)" }}>
          {loading ? "Ищем места…" : `${placesCount(places.length)} рядом`}
        </span>
        {!loading && places.length > 0 && (
          <button
            type="button"
            onClick={() => setListView((v) => !v)}
            className="text-sm font-semibold cursor-pointer"
            style={{ color: "var(--color-primary-strong)" }}
          >
            {listView ? "Каруселью" : "Списком"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="pb-6">
          <PlaceListSkeleton />
        </div>
      ) : places.length === 0 ? (
        <EmptyFilterState activeTagCount={0} totalCount={allCount} onReset={onResetFilters} />
      ) : listView ? (
        <div className="flex flex-col gap-2.5 px-4 pb-6 overflow-y-auto no-scrollbar" style={{ maxHeight: 420 }}>
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
      ) : (
        <div className="flex gap-3 px-4 pb-6 overflow-x-auto no-scrollbar">
          {places.map((p) => (
            <PlaceCard
              key={p.id}
              place={p}
              variant="column"
              onClick={() => onSelect(p.id)}
              favorite={isFavorite(p.id)}
              onToggleFavorite={() => onToggleFavorite(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
