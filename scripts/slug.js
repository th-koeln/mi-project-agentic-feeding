// Erzeugt den Slug für eine Arbeit und sucht nach möglichen Dubletten im Repo.
// Aufruf: npm run slug -- <vorname> <nachname> <YYYY-MM-DD>
import { slugify, loadAllWorks } from './lib/works.js';

const [firstname, lastname, date] = process.argv.slice(2);

if (!firstname || !lastname || !date) {
  console.error('Aufruf: npm run slug -- <vorname> <nachname> <YYYY-MM-DD>');
  process.exit(1);
}

const slug = slugify(firstname, lastname, date);
console.log(`Slug: ${slug}`);

const wantedLast = slugify(lastname);
const matches = loadAllWorks().filter((work) =>
  work.slug === slug || (work.data && slugify(work.data.lastname || '') === wantedLast)
);

if (!matches.length) {
  console.log('Keine vorhandene Arbeit mit diesem Nachnamen gefunden.');
} else {
  console.log('Mögliche Dubletten:');
  for (const work of matches) {
    const d = work.data || {};
    console.log(`  - ${work.slug}: ${d.firstname || '?'} ${d.lastname || '?'}, "${d.title || '?'}" (${d.type || '?'}, ${d.date || '?'})`);
  }
}
