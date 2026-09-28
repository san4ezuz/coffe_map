import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./client";
import { VALENCIA_CENTER } from "../lib/geo";

// Verifies the PostGIS setup end-to-end: the generated `location geography` column,
// the GiST index, and the exact "nearest N" query shape from valencia-map-project.md §7
// (ST_Distance + the <-> KNN operator) all work against the local Docker Postgres.
async function main() {
  const { lat, lng } = VALENCIA_CENTER;
  const rows = await db.execute(sql`
    SELECT name, ROUND(ST_Distance(location, ST_MakePoint(${lng}, ${lat})::geography)::numeric) AS dist_m
    FROM places
    ORDER BY location <-> ST_MakePoint(${lng}, ${lat})::geography
    LIMIT 5;
  `);

  console.log(`Nearest 5 places to Valencia center (${lat}, ${lng}):`);
  for (const row of rows) {
    console.log(`  ${String(row.dist_m).padStart(5)} m  ${row.name}`);
  }
  if (rows.length === 0) {
    console.log("  (no rows — did you run `npm run db:seed`?)");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
