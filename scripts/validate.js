// Validiert alle Arbeiten (oder die übergebenen Slugs) gegen das Schema und die Repo-Regeln.
// Aufruf: npm run validate [-- <slug> ...]
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ROOT, config, ASSET_FIELDS, isAbsoluteUrl, slugify, listWorkDirs, loadWork } from './lib/works.js';

const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'schema', 'thesis-schema.json'), 'utf8'));
// Das Upstream-Schema nennt eine nicht auflösbare Meta-Schema-URL; Ajv2020 kennt den Draft ohnehin.
delete schema.$schema;

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

function checkWork(work) {
  const errors = [];
  const warnings = [];

  if (work.error) return { errors: [work.error], warnings };

  const { data } = work;

  if (!validateSchema(data)) {
    for (const e of validateSchema.errors) {
      const field = e.instancePath ? e.instancePath.slice(1) : (e.params.missingProperty || e.params.additionalProperty || '');
      const hint = e.params.allowedValues ? ` (erlaubt: ${e.params.allowedValues.join(', ')})` : '';
      errors.push(`${field || 'Eintrag'}: ${e.message}${hint}`);
    }
  }

  // Repo-Regel: Hier liegen nur veröffentlichte Arbeiten
  if (data.visibility && data.visibility !== 'published') {
    errors.push('visibility: muss "published" sein – dieses Repo enthält nur veröffentlichte Arbeiten');
  }

  // Lokale Dateien müssen existieren
  for (const field of ASSET_FIELDS) {
    const value = data[field];
    if (!value || isAbsoluteUrl(value)) continue;
    const file = path.join(work.dir, value);
    if (!fs.existsSync(file)) {
      errors.push(`${field}: Datei "${value}" existiert nicht im Ordner der Arbeit`);
    } else if (field === 'thesis_url') {
      const mb = fs.statSync(file).size / 1024 / 1024;
      if (mb > config.maxPdfMb) {
        errors.push(`thesis_url: PDF ist ${mb.toFixed(1)} MB groß (max. ${config.maxPdfMb} MB) – bitte komprimieren`);
      }
    }
  }

  if (data.teaser_image_url && !isAbsoluteUrl(data.teaser_image_url) && !data.teaser_image_url.endsWith('.webp')) {
    warnings.push('teaser_image_url: kein WebP – Bild mit "npm run image" verarbeiten');
  }

  if (data.firstname && data.lastname && data.date) {
    const expected = slugify(data.firstname, data.lastname, data.date);
    if (expected !== work.slug) warnings.push(`Ordnername weicht vom erwarteten Slug "${expected}" ab`);
  }

  return { errors, warnings };
}

const requested = process.argv.slice(2);
const slugs = requested.length ? requested : listWorkDirs();

if (!slugs.length) {
  console.log('Keine Arbeiten gefunden.');
  process.exit(0);
}

let failed = 0;
for (const slug of slugs) {
  const { errors, warnings } = checkWork(loadWork(slug));
  if (errors.length) failed++;
  console.log(`${errors.length ? '✗' : '✓'} ${slug}`);
  for (const e of errors) console.log(`    Fehler:  ${e}`);
  for (const w of warnings) console.log(`    Hinweis: ${w}`);
}

console.log(`\n${slugs.length - failed} von ${slugs.length} Arbeiten gültig.`);
process.exit(failed ? 1 : 0);
