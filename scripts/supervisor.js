// Prüfer*innen nachschlagen und prüfen, ob die eigene Git-Identität zu einer Arbeit gehört.
// Aufruf: npm run supervisor -- lookup <name>
//         npm run supervisor -- check <slug>
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, loadWork } from './lib/works.js';

const supervisors = JSON.parse(fs.readFileSync(path.join(ROOT, 'supervisors.json'), 'utf8'));
const [command, ...rest] = process.argv.slice(2);
const arg = rest.join(' ').trim();

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

function gitConfig(key) {
  try {
    return execFileSync('git', ['config', key], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
}

if (command === 'lookup' && arg) {
  const q = norm(arg);
  const hits = supervisors.filter((s) =>
    norm(s.name).includes(q) || (s.aliases || []).some((a) => norm(a) === q)
  );
  if (!hits.length) {
    console.log(`Keine Prüfer*in zu "${arg}" in supervisors.json gefunden – bitte bei der Lehrenden nachfragen.`);
  } else {
    for (const s of hits) console.log(s.name);
  }
} else if (command === 'check' && arg) {
  const work = loadWork(arg);
  if (work.error) {
    console.error(`${arg}: ${work.error}`);
    process.exit(1);
  }
  const email = norm(gitConfig('user.email'));
  const me = supervisors.find((s) => (s.git_emails || []).some((e) => norm(e) === email));
  if (!email || !me) {
    console.log(`UNBEKANNT: Git-E-Mail "${email || '(nicht gesetzt)'}" ist keiner Prüfer*in in supervisors.json zugeordnet – keine Prüfung möglich.`);
  } else if ([work.data.first_supervisor, work.data.second_supervisor].includes(me.name)) {
    console.log(`OK: ${me.name} ist Prüfer*in dieser Arbeit.`);
  } else {
    console.log(`WARNUNG: ${me.name} ist weder Erst- noch Zweitprüfer*in dieser Arbeit (${work.data.first_supervisor} / ${work.data.second_supervisor}).`);
  }
} else {
  console.error('Aufruf: npm run supervisor -- lookup <name> | check <slug>');
  process.exit(1);
}
