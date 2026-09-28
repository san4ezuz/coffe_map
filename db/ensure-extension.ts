import "dotenv/config";
import postgres from "postgres";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set — see .env.example");
  const sql = postgres(process.env.DATABASE_URL, { max: 1 });
  await sql`CREATE EXTENSION IF NOT EXISTS postgis;`;
  console.log("postgis extension ready");
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
