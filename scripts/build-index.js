// Baut _site/ mit index.json und den Assets aller veröffentlichten Arbeiten.
// Aufruf: npm run build   (BASE_URL und OUT_DIR per Umgebungsvariable überschreibbar)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, config, ASSET_FIELDS, isAbsoluteUrl, loadAllWorks } from './lib/works.js';

const OUT_DIR = path.resolve(ROOT, process.env.OUT_DIR || '_site');
const BASE_URL = (process.env.BASE_URL || config.baseUrl).replace(/\/?$/, '/');

// Zeitpunkt des letzten Commits, der den Ordner der Arbeit berührt hat
function lastCommitDate(dir) {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', dir], { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] });
    return out.toString().trim() || null;
  } catch {
    return null;
  }
}

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

const works = [];
for (const work of loadAllWorks()) {
  if (work.error) {
    console.error(`✗ ${work.slug}: ${work.error} – bitte zuerst "npm run validate" ausführen`);
    process.exit(1);
  }
  if (work.data.visibility !== 'published') continue;

  const target = path.join(OUT_DIR, 'works', work.slug);
  fs.mkdirSync(target, { recursive: true });

  const entry = { id: work.slug, updated_at: lastCommitDate(work.dir), ...work.data };
  for (const field of ASSET_FIELDS) {
    const value = entry[field];
    if (!value || isAbsoluteUrl(value)) continue;
    fs.copyFileSync(path.join(work.dir, value), path.join(target, path.basename(value)));
    entry[field] = `${BASE_URL}works/${work.slug}/${encodeURIComponent(path.basename(value))}`;
  }
  works.push(entry);
}

works.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const index = {
  generated: new Date().toISOString(),
  schema: 'https://th-koeln.de/mi/abschlussarbeiten/schema/v1',
  count: works.length,
  works,
};

fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index, null, 2));
console.log(`index.json mit ${works.length} Arbeiten nach ${path.relative(ROOT, OUT_DIR)}/ geschrieben (Basis-URL: ${BASE_URL}).`);
