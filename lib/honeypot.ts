// Lightweight bot deterrent for the two public unauthenticated forms (/add, /report) — no
// external captcha service needed. Two signals, either one is enough to flag a submission:
//   1. a hidden field real users never see or fill in (bots that autofill every input do)
//   2. a submission that arrives faster than a human could plausibly fill the form

export const HONEYPOT_FIELD = "website";
export const FORM_LOADED_AT_FIELD = "formLoadedAt";
const MIN_FILL_TIME_MS = 1200;

export function looksLikeBot(body: Record<string, unknown>): boolean {
  const honeypot = body[HONEYPOT_FIELD];
  if (typeof honeypot === "string" && honeypot.trim().length > 0) return true;

  const loadedAt = body[FORM_LOADED_AT_FIELD];
  if (typeof loadedAt === "number") {
    if (Date.now() - loadedAt < MIN_FILL_TIME_MS) return true;
  }

  return false;
}
