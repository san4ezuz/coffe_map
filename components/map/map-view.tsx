"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import {
  Map as MaplibreMap,
  Marker,
  setWorkerUrl,
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapMouseEvent,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createRoot, type Root } from "react-dom/client";
import type { Place } from "@/lib/types";
import { VALENCIA_CENTER } from "@/lib/geo";
import { useTheme } from "@/components/theme/theme-provider";
import { Pin } from "./pin";

const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const INITIAL_ZOOM = 13;
const SELECT_ZOOM = 15;

if (typeof window !== "undefined") {
  const workerFile = process.env.NODE_ENV === "production" ? "maplibre-gl-worker.mjs" : "maplibre-gl-worker-dev.mjs";
  setWorkerUrl(`/${workerFile}`);
}

// Muted-warm / muted-dark tint over the OpenFreeMap "liberty" basemap, so it reads as
// "ours" rather than stock OSM (plan §6: приглушить фон, до появления собственного style.json).
const CANVAS_FILTER = {
  light: "saturate(0.45) sepia(0.12) brightness(1.04) contrast(0.96)",
  dark: "invert(1) hue-rotate(180deg) saturate(0.3) brightness(0.85) contrast(0.92)",
};

// Cluster badge colors. In light theme the original pale tint (#f9e7dc) all but
// disappears against the cream basemap, so it gets a solid brand-orange background with
// white text instead; dark theme already reads fine as-is (its canvas filter inverts the
// same pale tint into something visible), so it's left untouched.
const CLUSTER_COLORS = {
  light: { bg: "#e8622c", stroke: "#fffdf9", text: "#fffdf9" },
  dark: { bg: "#f9e7dc", stroke: "#fffdf9", text: "#c0501f" },
};

// Third-party POI icons/labels (cafes, shops, etc. not ours) clutter the map — plan §6
// point 2: показывать только свои места. OpenMapTiles-schema styles source these from a
// "poi" source-layer; hide every style layer built on it, whatever OpenFreeMap names them.
function hideForeignPois(map: MaplibreMap) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if ("source-layer" in layer && layer["source-layer"] === "poi") {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  }
}

// The "liberty" style has both a flat `building` fill layer (zoom 13–14 only) and a
// `building-3d` fill-extrusion layer that's meant to take over above that. Hide the
// extrusion layer and extend the flat one to cover the full zoom range instead, so
// buildings stay visible — as flat footprints, never pitched/tilted 3D blocks — at
// every zoom rather than disappearing above 14.
function hideBuildingExtrusion(map: MaplibreMap) {
  for (const layer of map.getStyle()?.layers ?? []) {
    if (layer.type === "fill-extrusion") {
      map.setLayoutProperty(layer.id, "visibility", "none");
    } else if (layer.type === "fill" && layer.id === "building") {
      map.setLayerZoomRange(layer.id, layer.minzoom ?? 0, 24);
    }
  }
}

export interface MapViewHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

function toGeoJSON(places: Place[]): GeoJSON.FeatureCollection<GeoJSON.Point, { id: string }> {
  return {
    type: "FeatureCollection",
    features: places.map((p) => ({
      type: "Feature",
      properties: { id: p.id },
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
  };
}

export const MapView = forwardRef<
  MapViewHandle,
  {
    places: Place[];
    selected: Place | null;
    onSelectPin: (id: string) => void;
    onMovedChange?: (moved: boolean) => void;
  }
>(function MapView({ places, selected, onSelectPin, onMovedChange }, ref) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef<Map<string, { marker: Marker; root: Root }>>(new Map());
  const placesRef = useRef(places);
  const selectedRef = useRef(selected);
  const onSelectPinRef = useRef(onSelectPin);
  const themeRef = useRef(theme);
  placesRef.current = places;
  selectedRef.current = selected;
  onSelectPinRef.current = onSelectPin;
  themeRef.current = theme;

  useImperativeHandle(ref, () => ({
    zoomIn: () => mapRef.current?.zoomIn(),
    zoomOut: () => mapRef.current?.zoomOut(),
    resetView: () =>
      mapRef.current?.flyTo({ center: [VALENCIA_CENTER.lng, VALENCIA_CENTER.lat], zoom: INITIAL_ZOOM }),
  }));

  // Init map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const map = new MaplibreMap({
      container: containerRef.current,
      style: STYLE_URL,
      center: [VALENCIA_CENTER.lng, VALENCIA_CENTER.lat],
      zoom: INITIAL_ZOOM,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __mestaMap?: MaplibreMap }).__mestaMap = map;
    }
    const markers = markersRef.current;

    function updateMarkers() {
      const src = map.getSource("places") as GeoJSONSource | undefined;
      if (!src) return;
      const rendered = map.querySourceFeatures("places", {
        filter: ["!", ["has", "point_count"]],
      });
      const byId = new Map(placesRef.current.map((p) => [p.id, p]));
      const seen = new Set<string>();

      for (const f of rendered) {
        const id = f.properties?.id as string | undefined;
        if (!id || seen.has(id)) continue;
        const place = byId.get(id);
        if (!place) continue;
        seen.add(id);

        let entry = markers.get(id);
        if (!entry) {
          const el = document.createElement("div");
          const root = createRoot(el);
          const marker = new Marker({ element: el, anchor: "top-left" })
            .setLngLat([place.lng, place.lat])
            .addTo(map);
          entry = { marker, root };
          markers.set(id, entry);
        }
        entry.root.render(
          <Pin
            category={place.category}
            selected={selectedRef.current?.id === id}
            onClick={() => onSelectPinRef.current(id)}
          />
        );
      }

      for (const [id, entry] of markers) {
        if (!seen.has(id)) {
          entry.marker.remove();
          entry.root.unmount();
          markers.delete(id);
        }
      }
    }

    map.on("load", () => {
      map.getCanvas().style.filter = CANVAS_FILTER[themeRef.current];
      hideForeignPois(map);
      hideBuildingExtrusion(map);

      map.addSource("places", {
        type: "geojson",
        data: toGeoJSON(placesRef.current),
        cluster: true,
        clusterRadius: 60,
        clusterMaxZoom: 15,
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "places",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": CLUSTER_COLORS[themeRef.current].bg,
          "circle-stroke-width": 2,
          "circle-stroke-color": CLUSTER_COLORS[themeRef.current].stroke,
          "circle-radius": ["step", ["get", "point_count"], 20, 10, 26, 25, 32],
        },
      });
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "places",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Bold"],
          "text-size": 14,
        },
        paint: { "text-color": CLUSTER_COLORS[themeRef.current].text },
      });

      map.on("click", "clusters", (e: MapMouseEvent) => {
        const [feature] = map.queryRenderedFeatures(e.point, { layers: ["clusters"] }) as MapGeoJSONFeature[];
        const clusterId = feature?.properties?.cluster_id;
        const src = map.getSource("places") as GeoJSONSource;
        if (clusterId == null) return;
        src.getClusterExpansionZoom(clusterId).then((zoom: number) => {
          const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number];
          map.easeTo({ center: coords, zoom });
        });
      });
      map.on("mouseenter", "clusters", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "clusters", () => (map.getCanvas().style.cursor = ""));

      // GeoJSON clustering builds its index asynchronously, so querySourceFeatures only
      // returns results reliably once the source itself reports loaded — NOT once the
      // whole map is "idle". The base style's own raster hillshade layer can sit pending
      // indefinitely (an OpenFreeMap/upstream quirk), which means map-wide 'idle'/'load'
      // may never fire even though every layer we actually care about is long since ready;
      // gating on our own source keeps marker rendering independent of that.
      map.on("data", (e) => {
        if (e.dataType === "source" && (e as unknown as { sourceId?: string }).sourceId === "places") {
          updateMarkers();
        }
      });
      updateMarkers();
    });

    map.on("moveend", () => {
      updateMarkers();
      if (onMovedChange) {
        const c = map.getCenter();
        const moved =
          Math.abs(c.lng - VALENCIA_CENTER.lng) > 0.01 ||
          Math.abs(c.lat - VALENCIA_CENTER.lat) > 0.01 ||
          Math.abs(map.getZoom() - INITIAL_ZOOM) > 0.5;
        onMovedChange(moved);
      }
    });

    return () => {
      markers.forEach(({ marker, root }) => {
        marker.remove();
        root.unmount();
      });
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-tint the basemap and cluster badges when the theme toggles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      map.getCanvas().style.filter = CANVAS_FILTER[theme];
      const colors = CLUSTER_COLORS[theme];
      if (map.getLayer("clusters")) {
        map.setPaintProperty("clusters", "circle-color", colors.bg);
        map.setPaintProperty("clusters", "circle-stroke-color", colors.stroke);
      }
      if (map.getLayer("cluster-count")) {
        map.setPaintProperty("cluster-count", "text-color", colors.text);
      }
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [theme]);

  // Keep the source data in sync when the filtered place list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const src = map.getSource("places") as GeoJSONSource | undefined;
      src?.setData(toGeoJSON(places));
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [places]);

  // Re-render markers (selection highlight) and fly to the selected place.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    for (const [id, entry] of markersRef.current) {
      const place = places.find((p) => p.id === id);
      if (!place) continue;
      entry.root.render(
        <Pin
          category={place.category}
          selected={selected?.id === id}
          onClick={() => onSelectPinRef.current(id)}
        />
      );
    }
    if (selected) {
      map.flyTo({ center: [selected.lng, selected.lat], zoom: Math.max(map.getZoom(), SELECT_ZOOM) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Inline style, not a Tailwind class: MapLibre adds its own "maplibregl-map" class to
  // this exact element and maplibre-gl.css sets `.maplibregl-map { position: relative }`
  // on it, which — loaded after Tailwind — overrides a class-based `absolute`, collapsing
  // this container (and the canvas inside it) to zero height. An inline style always
  // outranks any class selector regardless of stylesheet order, so it can't be overridden
  // the same way.
  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
});
