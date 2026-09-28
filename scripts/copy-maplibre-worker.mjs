// Turbopack's static analysis of maplibre-gl's dynamic worker URL selection
// (`e.endsWith('-dev.mjs') ? workerDevUrl : workerUrl`) resolves to the wrong file —
// it points the Worker at the main library bundle instead of the worker bundle, so tile
// parsing silently never completes and the map never finishes its first render. Serving
// the real worker script as a static file and pointing maplibregl.setWorkerUrl() at it
// (see components/map/map-view.tsx) works around the bug entirely.
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, "..", "node_modules", "maplibre-gl", "dist");
const destDir = path.join(here, "..", "public");

mkdirSync(destDir, { recursive: true });
// Each worker file imports its "-shared" counterpart as a relative sibling, so copy
// both pairs — the prod pair (maplibre-gl.mjs) and the dev pair (maplibre-gl-dev.mjs,
// what `next dev` actually loads). The two pairs speak slightly different internal
// protocol versions; using the wrong one leaves tiles silently unparsed forever with
// no error event (see components/map/map-view.tsx).
const files = [
  "maplibre-gl-worker.mjs",
  "maplibre-gl-shared.mjs",
  "maplibre-gl-worker-dev.mjs",
  "maplibre-gl-shared-dev.mjs",
];
for (const file of files) {
  copyFileSync(path.join(srcDir, file), path.join(destDir, file));
  console.log(`Copied maplibre-gl worker dependency to public/${file}`);
}
