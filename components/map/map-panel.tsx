"use client";

import { useRef, useState } from "react";
import type { Place } from "@/lib/types";
import { MapView, type MapViewHandle } from "./map-view";

export function MapPanel({
  places,
  selected,
  onSelectPin,
  children,
}: {
  places: Place[];
  selected: Place | null;
  onSelectPin: (id: string) => void;
  children?: React.ReactNode;
}) {
  const mapHandle = useRef<MapViewHandle>(null);
  const [moved, setMoved] = useState(false);

  return (
    <div className="relative flex-1 min-w-0 overflow-hidden">
      <MapView ref={mapHandle} places={places} selected={selected} onSelectPin={onSelectPin} onMovedChange={setMoved} />

      <div
        className="hidden lg:flex absolute top-5 right-5 flex-col rounded-xl overflow-hidden"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <button
          type="button"
          aria-label="Приблизить"
          onClick={() => mapHandle.current?.zoomIn()}
          className="w-11 h-11 flex items-center justify-center text-xl cursor-pointer"
          style={{ color: "var(--color-text)", borderBottom: "1px solid var(--color-border)" }}
        >
          +
        </button>
        <button
          type="button"
          aria-label="Отдалить"
          onClick={() => mapHandle.current?.zoomOut()}
          className="w-11 h-11 flex items-center justify-center text-xl cursor-pointer"
          style={{ color: "var(--color-text)" }}
        >
          −
        </button>
      </div>

      {moved && (
        <button
          type="button"
          onClick={() => mapHandle.current?.resetView()}
          className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full px-5.5 py-3 text-sm font-semibold cursor-pointer"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
        >
          Искать в этой области
        </button>
      )}

      {children}
    </div>
  );
}
