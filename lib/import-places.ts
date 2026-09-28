export interface ImportRow {
  name: string;
  address: string;
  lat: number;
  lng: number;
  district?: string;
  phone?: string;
  whatsapp?: string;
  instagram?: string;
  googleMapsUrl?: string;
  hours?: string;
  description?: string;
  tags: string[];
}

export interface ImportError {
  line: number;
  message: string;
}

const COLUMN_ALIASES: Record<string, Exclude<keyof ImportRow, "tags"> | "raw"> = {
  name: "name",
  название: "name",
  address: "address",
  адрес: "address",
  district: "district",
  район: "district",
  lat: "lat",
  широта: "lat",
  lng: "lng",
  lon: "lng",
  долгота: "lng",
  phone: "phone",
  телефон: "phone",
  whatsapp: "whatsapp",
  instagram: "instagram",
  googlemapsurl: "googleMapsUrl",
  google_maps_url: "googleMapsUrl",
  googlemaps: "googleMapsUrl",
  hours: "hours",
  часы: "hours",
  description: "description",
  описание: "description",
  tags: "raw",
  теги: "raw",
};

function detectDelimiter(headerLine: string): string {
  return headerLine.includes("\t") ? "\t" : ",";
}

function splitLine(line: string, delimiter: string): string[] {
  return line.split(delimiter).map((cell) => cell.trim());
}

export function parseImportText(text: string): { rows: ImportRow[]; errors: ImportError[] } {
  const lines = text.split(/\r\n|\r|\n/).filter((l) => l.trim().length > 0);
  const rows: ImportRow[] = [];
  const errors: ImportError[] = [];

  if (lines.length < 2) {
    return { rows, errors: [{ line: 0, message: "Нужна строка заголовков и хотя бы одна строка данных" }] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headerCells = splitLine(lines[0], delimiter).map((h) => h.toLowerCase());
  const columns = headerCells.map((h) => COLUMN_ALIASES[h]);

  if (!columns.includes("name") || !columns.includes("address") || !columns.includes("lat") || !columns.includes("lng")) {
    return {
      rows,
      errors: [{ line: 1, message: "В заголовках должны быть как минимум: name, address, lat, lng" }],
    };
  }

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const cells = splitLine(lines[i], delimiter);
    const row: Partial<ImportRow> & { tags: string[] } = { tags: [] };

    columns.forEach((col, idx) => {
      const value = cells[idx] ?? "";
      if (!col || value === "") return;
      if (col === "raw") {
        row.tags = value
          .split(/[;,]/)
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (col === "lat" || col === "lng") {
        row[col] = Number(value);
      } else {
        row[col] = value;
      }
    });

    if (!row.name) {
      errors.push({ line: lineNum, message: "Пропущено name" });
      continue;
    }
    if (!row.address) {
      errors.push({ line: lineNum, message: `${row.name}: пропущен address` });
      continue;
    }
    if (!Number.isFinite(row.lat) || !Number.isFinite(row.lng)) {
      errors.push({ line: lineNum, message: `${row.name}: lat/lng не число` });
      continue;
    }

    rows.push(row as ImportRow);
  }

  return { rows, errors };
}
