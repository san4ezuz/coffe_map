import { NextResponse, type NextRequest } from "next/server";
import { parseImportText } from "@/lib/import-places";
import { importPlaces } from "@/db/admin-places";

export async function POST(request: NextRequest) {
  const { text } = (await request.json()) as { text?: string };
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "Пустой текст" }, { status: 400 });
  }

  const { rows, errors: parseErrors } = parseImportText(text);
  if (rows.length === 0) {
    return NextResponse.json({ created: [], updated: [], errors: parseErrors.map((e) => `Строка ${e.line}: ${e.message}`) });
  }

  try {
    const { created, updated, errors: importErrors } = await importPlaces(rows);
    return NextResponse.json({
      created,
      updated,
      errors: [
        ...parseErrors.map((e) => `Строка ${e.line}: ${e.message}`),
        ...importErrors.map((e) => `${e.row.name}: ${e.message}`),
      ],
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
