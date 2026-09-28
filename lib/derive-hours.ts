// Best-effort "closes at" extraction from a free-form hours string like
// "Пн–Пт 9:00–20:00, Сб–Вс 10:00–20:00" — takes the last HH:MM found as a display
// fallback. Real per-day open/closed state needs a proper day-aware parser (see
// valencia-map-project.md §12.6); deliberately out of scope until then, so
// `isOpenNow` is always reported true.
export function deriveOpenState(raw: string | undefined | null): { openUntil: string; isOpenNow: boolean } {
  const matches = raw?.match(/\d{1,2}:\d{2}/g) ?? [];
  const openUntil = matches.length > 0 ? matches[matches.length - 1] : "—";
  return { openUntil, isOpenNow: true };
}
