// Konvertiert ein Bild zu works/<slug>/teaser.webp (max. 1600 px breit).
// Aufruf: npm run image -- <bilddatei> <slug>
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { config, WORKS_DIR } from './lib/works.js';

const [input, slug] = process.argv.slice(2);

if (!input || !slug) {
  console.error('Aufruf: npm run image -- <bilddatei> <slug>');
  process.exit(1);
}
if (!fs.existsSync(input)) {
  console.error(`Bild nicht gefunden: ${input}`);
  process.exit(1);
}

const dir = path.join(WORKS_DIR, slug);
fs.mkdirSync(dir, { recursive: true });
const output = path.join(dir, 'teaser.webp');

const info = await sharp(input)
  .rotate() // EXIF-Ausrichtung übernehmen
  .resize({ width: config.teaserMaxWidth, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile(output);

const kb = Math.round(info.size / 1024);
console.log(`✓ ${output} (${info.width}×${info.height}, ${kb} KB)`);
if (info.width < 800) console.log('  Hinweis: Das Bild ist schmaler als 800 px und wirkt auf der Website eventuell unscharf.');
