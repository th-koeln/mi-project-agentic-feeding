# Spezifikation: agentischer Ingest für Abschlussarbeiten

Stand: 22.10.2026. Ergebnis der Anforderungsklärung mit Christian Noss.

## Kontext

Die Medieninformatik-Website zeigt Projekte und Abschlussarbeiten über den `mi-project-proxy`, der JSON aus mehreren Quellen zusammenführt (persönliche Websites wie `cnoss/thesis`, Kirby-Backend). Dieses Repo ergänzt eine weitere Quelle: Lehrende pflegen Arbeiten mit ihrem KI-Agenten ein, aus Dokumenten oder per Diktat.

## Entscheidungen

| # | Thema | Entscheidung | Begründung |
|---|---|---|---|
| 1 | Zielgruppe | Nur Lehrende | Kein Review-Workflow für Studierende nötig, technisches Grundverständnis vorausgesetzt |
| 2 | Datenablage | Ein zentrales Repo `th-koeln/mi-project-agentic-feeding`, Auslieferung über GitHub Pages | Eine Quelle und ein Adapter für den Proxy, Git-Historie als Audit-Trail, keine Kirby-Zugänge nötig |
| 3 | Scope | Nur Arbeiten nach dem bestehenden Thesis-Schema | Neuer Ingest und Schema-Umbau nicht vermischen |
| 4 | Agent | Agentenagnostisch: `AGENTS.md` als Quelle, `CLAUDE.md` und Skill als dünne Hülle, Claude Code als Referenz | Niemanden wegen der Wahl des Agenten ausschließen |
| 5 | Voice | Nur Diktat im Dialog (Voice-Modus des Agenten bzw. OS). Keine Audioverarbeitung im Repo | Die Anleitung braucht nur einen Interview-Modus für bruchstückhafte Angaben |
| 6a | Teaserbild | Pflicht. Skript konvertiert zu WebP mit max. 1600 px. Fehlt ein Bild, fragt der Agent immer nach | Die Website braucht immer ein Bild |
| 6b | Copyright | Immer nachfragen. Bleibt es unklar, wird die Autor*in eingetragen | Nichts erfinden |
| 6c | PDF | Veröffentlichung nur nach ausdrücklicher Zustimmung. Max. 20 MB, sonst Hinweis zum Komprimieren | Rechte, Repo-Größe |
| 6d | Rohmaterial | `_inbox/` steht in `.gitignore`, Rohmaterial kommt nie ins Repo | Öffentliches Repo |
| 7 | Freigabe | Lokale Validierung grün → Bestätigung → direkter Push auf `main`. Die CI validiert vor dem Deploy erneut | Lehrende sind vertrauenswürdig, PRs wären hier nur Reibung |
| 7b | Visibility | Immer `published`, die Validierung lehnt alles andere ab | Hier liegen nur veröffentlichte Arbeiten |
| 8 | Bestand | Dubletten-Check nur in `works/`, nicht in anderen Quellen. Updates mit Diff vor dem Commit. **Löschen nur von Hand, nie durch den Agenten** | |
| 9 | Proxy | Immer `internal` gerendert, das Repo ist reine Datenquelle. Das `index.json`-Format ist der Vertrag (siehe README). Der PHP-Adapter gehört nicht zum Scope | |
| 10 | Stack | Node (`ajv`, `sharp`, `yaml`). Der Agent führt `npm install` selbst aus, `npm run doctor` prüft das Setup, ein Devcontainer ist optional | Am weitesten verbreitet |
| 11 | Inhalt | Keywords generiert der Agent nur, wenn das Material keine enthält. Abstract wird wörtlich aus der PDF übernommen, bei unverhältnismäßiger Länge kürzt er nach Rückfrage. Diktate darf er zu Schriftsprache glätten. Rechtschreib- und Grammatikfehler korrigiert er sichtbar. Prüfer*innen ergänzt er über `supervisors.json`. Alles andere kommt aus dem Material oder von der Lehrenden | Inhaltliche Hoheit liegt bei den Lehrenden |
| 12 | Dateiformat | `works/<slug>/thesis.md`: Frontmatter enthält die Schema-Felder, der Body ist der `abstract` | Von Hand leichter zu pflegen als JSON |
| 13 | Build | Kein Jekyll. Node-Skript validiert gegen das Schema und baut `_site/index.json`, Deploy über eine GitHub Action | Eine Toolchain, kein Ruby |
| 14 | Mehrbenutzerbetrieb | Ein Ordner pro Arbeit. `index.json` liegt nie im Repo. Der Agent macht `pull --rebase` vor Start und Push, die CI hat eine `concurrency`-Gruppe | Praktisch keine Konflikte |
| 15 | Fremde Einträge | Der Agent warnt, wenn die Git-E-Mail laut `supervisors.json` weder Erst- noch Zweitprüfer*in ist. Er verhindert nichts | Versehentliche Änderungen vermeiden |
| 16 | Slug | `vorname-nachname-YYYY-MM-DD`, ASCII-normalisiert, bleibt bei Änderungen stabil | Gleiches Muster wie Kirby |

## Offene Punkte außerhalb dieses Repos

- Im Upstream-Schema (`mi-project-proxy/thesis-schema.json`) steht der Tippfehler `"Guided Projct"`. Nach der Korrektur: `npm run sync-schema`.
- Das Upstream-Schema nennt `$schema: "https://json-schema.org/draft/2020-12"` (korrekt wäre `…/draft/2020-12/schema`). `validate.js` umgeht das.
- PHP-Adapter für `index.json` im Proxy (`detail.mode: internal`).

## Mögliche Ausbaustufen

- Lehr- und Forschungsprojekte (eigenes Schema, mehrere Autor*innen)
- Studierende als Einreichende mit PR-Workflow
