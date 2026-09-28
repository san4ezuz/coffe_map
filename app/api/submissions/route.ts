import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { submissions, submissionTypeValues } from "@/db/schema";
import { looksLikeBot, HONEYPOT_FIELD, FORM_LOADED_AT_FIELD } from "@/lib/honeypot";

interface AddPlaceBody extends Record<string, unknown> {
  kind: "add_place";
  name: string;
  type: string;
  address: string;
  tags: string[];
  description: string;
  contact: string;
}

interface ReportProblemBody extends Record<string, unknown> {
  kind: "report_problem";
  placeId: string;
  placeSlug: string;
  placeName: string;
  reason: string;
  comment: string;
  contact: string;
}

function isAddPlaceBody(body: Record<string, unknown>): body is AddPlaceBody {
  return (
    typeof body.name === "string" &&
    body.name.trim().length > 0 &&
    typeof body.address === "string" &&
    body.address.trim().length > 0 &&
    typeof body.type === "string" &&
    Array.isArray(body.tags) &&
    typeof body.description === "string" &&
    typeof body.contact === "string"
  );
}

function isReportProblemBody(body: Record<string, unknown>): body is ReportProblemBody {
  return (
    typeof body.placeId === "string" &&
    body.placeId.trim().length > 0 &&
    typeof body.placeSlug === "string" &&
    typeof body.placeName === "string" &&
    typeof body.reason === "string" &&
    body.reason.trim().length > 0 &&
    typeof body.comment === "string" &&
    typeof body.contact === "string"
  );
}

function parseBody(body: unknown): { type: (typeof submissionTypeValues)[number]; payload: object } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { kind: _kind, [HONEYPOT_FIELD]: _hp, [FORM_LOADED_AT_FIELD]: _t, ...payload } = b;
  if (b.kind === "add_place" && isAddPlaceBody(b)) return { type: "add_place", payload };
  if (b.kind === "report_problem" && isReportProblemBody(b)) return { type: "report_problem", payload };
  return null;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.json().catch(() => null);

  if (rawBody && typeof rawBody === "object" && looksLikeBot(rawBody as Record<string, unknown>)) {
    // Pretend it worked — a real 201 with a made-up id tells a bot nothing useful,
    // while an error response would help it iterate towards bypassing the check.
    return NextResponse.json({ id: "00000000-0000-0000-0000-000000000000" }, { status: 201 });
  }

  const parsed = parseBody(rawBody);
  if (!parsed) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const [row] = await db
    .insert(submissions)
    .values({
      type: parsed.type,
      payload: parsed.payload,
      source: "web",
      status: "pending",
    })
    .returning({ id: submissions.id });

  return NextResponse.json({ id: row.id }, { status: 201 });
}
