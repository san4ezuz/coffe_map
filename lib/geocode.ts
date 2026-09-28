// Free, no-key geocoding via OpenStreetMap Nominatim (plan §12.4 day 1–2). Respect their
// usage policy: identify the app via User-Agent, and this is only ever called from the
// low-volume admin approve action, not per-request on the public site.
//
// A plain text query without spatial hints can match a same-named square/street in the
// wrong city (verified: "Plaza del Ayuntamiento, 1" alone resolved ~150km away, near
// Alicante) — bias results to a bounding box around Valencia to avoid that.
const VALENCIA_VIEWBOX = "-0.55,39.35,-0.20,39.60"; // lon_min,lat_min,lon_max,lat_max

export async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("viewbox", VALENCIA_VIEWBOX);
  url.searchParams.set("bounded", "1");

  const res = await fetch(url, {
    headers: { "User-Agent": "Mesta/0.1 (mesta.city; local dev build)" },
  });
  if (!res.ok) return null;

  const results = (await res.json()) as { lat: string; lon: string }[];
  const [result] = results;
  if (!result) return null;

  return { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
}
