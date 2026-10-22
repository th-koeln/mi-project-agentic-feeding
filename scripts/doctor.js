// Prüft, ob die lokale Umgebung für den Ingest bereit ist.
// Aufruf: npm run doctor
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT } from './lib/works.js';

let problems = 0;
const ok = (msg) => console.log(`✓ ${msg}`);
const fail = (msg, fix) => { problems++; console.log(`✗ ${msg}${fix ? `\n    → ${fix}` : ''}`); };
const warn = (msg) => console.log(`! ${msg}`);

function git(...args) {
  return execFileSync('git', args, { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

const major = Number(process.versions.node.split('.')[0]);
major >= 20 ? ok(`Node ${process.versions.node}`) : fail(`Node ${process.versions.node} ist zu alt`, 'Node 20 oder neuer installieren');

fs.existsSync(path.join(ROOT, 'node_modules', 'sharp')) ? ok('Abhängigkeiten installiert') : fail('Abhängigkeiten fehlen', 'npm install');

try {
  git('rev-parse', '--is-inside-work-tree');
  ok('Git-Repository');

  const email = git('config', 'user.email');
  email ? ok(`Git-Identität: ${email}`) : fail('Git-E-Mail nicht gesetzt', 'git config --global user.email "…"');

  const supervisors = JSON.parse(fs.readFileSync(path.join(ROOT, 'supervisors.json'), 'utf8'));
  const me = supervisors.find((s) => (s.git_emails || []).includes(email));
  me ? ok(`Zugeordnet zu: ${me.name}`) : warn('Git-E-Mail ist in supervisors.json keiner Prüfer*in zugeordnet – die Warnung bei fremden Arbeiten funktioniert dann nicht');

  try {
    const remote = git('remote', 'get-url', 'origin');
    ok(`Remote: ${remote}`);
    try {
      git('ls-remote', '--heads', 'origin');
      ok('Remote erreichbar');
    } catch {
      fail('Remote nicht erreichbar', 'Netzwerk und GitHub-Zugang (SSH-Key / gh auth login) prüfen');
    }
  } catch {
    fail('Kein Remote "origin"', 'git remote add origin git@github.com:th-koeln/mi-project-agentic-feeding.git');
  }
} catch {
  fail('Kein Git-Repository', 'Repo mit git clone holen statt als ZIP herunterladen');
}

console.log(problems ? `\n${problems} Problem(e) gefunden.` : '\nAlles bereit.');
process.exit(problems ? 1 : 0);
