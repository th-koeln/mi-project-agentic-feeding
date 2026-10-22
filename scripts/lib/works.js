// Gemeinsame Helfer: Konfiguration, Laden und Normalisieren der Arbeiten.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
export const config = pkg.config;

export const WORKS_DIR = path.resolve(ROOT, process.env.WORKS_DIR || 'works');
export const WORK_FILE = 'thesis.md';

// Felder, die auf Dateien im Ordner der Arbeit verweisen dürfen
export const ASSET_FIELDS = ['teaser_image_url', 'thesis_url', 'avatar_url'];

export const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

// "Ricardo", "Timm", "2026-07-24" -> "ricardo-timm-2026-07-24"
export function slugify(...parts) {
  return parts
    .join(' ')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Trennt "---\n<yaml>\n---\n<body>" in Frontmatter und Body
function splitFrontmatter(text) {
  const match = text.replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)([\s\S]*)$/);
  if (!match) throw new Error('Kein YAML-Frontmatter gefunden (Datei muss mit --- beginnen und den Block mit --- schließen)');
  return { frontmatter: match[1], body: match[2] };
}

export function listWorkDirs() {
  if (!fs.existsSync(WORKS_DIR)) return [];
  return fs.readdirSync(WORKS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
    .sort();
}

// Liest works/<slug>/thesis.md und liefert das Schema-Objekt (Frontmatter + abstract aus dem Body)
export function loadWork(slug) {
  const dir = path.join(WORKS_DIR, slug);
  const file = path.join(dir, WORK_FILE);
  const result = { slug, dir, file, data: null, error: null };

  if (!fs.existsSync(file)) {
    result.error = `${WORK_FILE} fehlt`;
    return result;
  }

  try {
    const { frontmatter, body } = splitFrontmatter(fs.readFileSync(file, 'utf8'));
    // YAML 1.2 Core: unquotierte Datumsangaben bleiben Strings
    const parsed = YAML.parse(frontmatter) || {};
    const data = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== null && value !== undefined && value !== '') data[key] = value;
    }
    const abstract = body.trim();
    if (abstract) data.abstract = abstract;
    result.data = data;
  } catch (err) {
    // +1, weil die erste Zeile der Datei das öffnende --- ist
    const where = err.linePos ? ` (Zeile ${err.linePos[0].line + 1})` : '';
    result.error = `YAML-Frontmatter nicht lesbar${where}: ${err.message.split('\n')[0]}`;
  }
  return result;
}

export function loadAllWorks() {
  return listWorkDirs().map(loadWork);
}
