// Holt das aktuelle Schema aus mi-project-proxy (einzige Schema-Wahrheit).
// Aufruf: npm run sync-schema
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config } from './lib/works.js';

const res = await fetch(config.schemaUpstream);
if (!res.ok) {
  console.error(`Download fehlgeschlagen: ${res.status} ${res.statusText}`);
  process.exit(1);
}
const text = await res.text();
JSON.parse(text); // nur gültiges JSON übernehmen

const target = path.join(ROOT, 'schema', 'thesis-schema.json');
const changed = !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== text;
fs.writeFileSync(target, text);
console.log(changed ? '✓ Schema aktualisiert – bitte "npm run validate" ausführen.' : '✓ Schema ist aktuell.');
