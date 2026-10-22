# mi-project-agentic-feeding

Abschlussarbeiten für die Medieninformatik-Website der TH Köln mit dem eigenen KI-Agenten einpflegen. Dokumente in einen Ordner legen oder diktieren: Der Agent zieht die Angaben heraus, fragt fehlende Angaben nach, validiert und veröffentlicht.

Das Repo ist eine Datenquelle für den [mi-project-proxy](https://github.com/th-koeln/mi-project-proxy). Die Website rendert die Detailseiten selbst (`detail.mode: internal`).

## Für Lehrende: loslegen

```bash
git clone git@github.com:th-koeln/mi-project-agentic-feeding.git
cd mi-project-agentic-feeding
```

1. Projekt in der IDE öffnen und den Agenten starten (Claude Code, Codex, Cursor, Copilot …).
2. Material zur Arbeit nach `_inbox/` legen: PDF, Exposé, Bilder, Notizen. `_inbox/` wird nie committet.
3. Dem Agenten sagen: **„Neue Arbeit eintragen.“** In Claude Code geht auch `/ingest-thesis`.
4. Fragen beantworten (gern per Diktat), Zusammenfassung prüfen, bestätigen. Der Agent pusht. Nach ca. 1–2 Minuten ist die Arbeit live.

`npm install` und den Umgebungscheck (`npm run doctor`) übernimmt der Agent beim ersten Mal selbst. Ohne lokales Setup lässt sich das Repo auch in GitHub Codespaces öffnen.

**Einmalig:** Trag deine Git-E-Mail bei deinem Eintrag in `supervisors.json` unter `git_emails` ein. Dann warnt der Agent, wenn du eine Arbeit änderst, bei der du nicht Prüfer*in bist.

**Löschen** macht der Agent nicht. Um eine Arbeit zu entfernen, löschst du den Ordner `works/<slug>/` selbst und pushst.

## Aufbau

```
works/<slug>/thesis.md      Frontmatter = Schema-Felder, Body = Abstract (Markdown)
works/<slug>/teaser.webp    Teaserbild (Pflicht, max. 1600 px breit)
works/<slug>/thesis.pdf     optional, max. 20 MB, nur mit Freigabe
_inbox/                     Rohmaterial, in .gitignore
schema/thesis-schema.json   Kopie aus mi-project-proxy (npm run sync-schema)
supervisors.json            Prüfer*innen: volle Schreibweise, Kurzformen, Git-E-Mails
scripts/                    validate, build-index, process-image, slug, supervisor, doctor
examples/works/             Beispielarbeit für npm test (wird nicht veröffentlicht)
AGENTS.md                   Anleitung für den Agenten (CLAUDE.md und Skill verweisen darauf)
SPEC.md                     Entscheidungen und Begründungen
```

`<slug>` = `vorname-nachname-YYYY-MM-DD`, ASCII-normalisiert (z. B. `ricardo-timm-2026-07-24`).

## Build und Deploy

Bei jedem Push auf `main` läuft [.github/workflows/deploy.yml](.github/workflows/deploy.yml):

1. `npm run validate`: alle Arbeiten gegen Schema und Repo-Regeln prüfen. Bei einem Fehler wird nicht deployt.
2. `npm run build`: `_site/` mit `index.json` und den Assets erzeugen.
3. Deploy auf GitHub Pages.

`index.json` ist ein reines Build-Ergebnis und liegt nie im Repo. Deshalb gibt es keine Merge-Konflikte, wenn mehrere Lehrende gleichzeitig einpflegen.

**Einrichtung (einmalig):** Repo-Settings → Pages → Source: „GitHub Actions“.

## Schnittstelle: `index.json`

URL: `https://th-koeln.github.io/mi-project-agentic-feeding/index.json`

```json
{
  "generated": "2026-10-22T14:43:50.167Z",
  "schema": "https://th-koeln.de/mi/abschlussarbeiten/schema/v1",
  "count": 1,
  "works": [
    {
      "id": "ricardo-timm-2026-07-24",
      "updated_at": "2026-10-22T16:40:00+02:00",
      "title": "Semantic Motion in Web UIs",
      "type": "Bachelorarbeit",
      "date": "2026-07-24",
      "status": "finished",
      "visibility": "published",
      "firstname": "Ricardo",
      "lastname": "Timm",
      "first_supervisor": "Prof. Christian Noss",
      "second_supervisor": "Prof. Dr. Hoai Viet Nguyen",
      "teaser_image_url": "https://th-koeln.github.io/mi-project-agentic-feeding/works/ricardo-timm-2026-07-24/teaser.webp",
      "teaser_image_copyright": "Ricardo Timm",
      "keywords": ["Motion Design", "UI-Animation"],
      "abstract": "Animationen geben Benutzeroberflächen …"
    }
  ]
}
```

Vertrag:

- Jedes Element in `works` ist ein gültiges Objekt nach [thesis-schema.json](schema/thesis-schema.json), **plus** zwei Felder:
  - `id`: stabiler Slug (= Ordnername). Bleibt auch erhalten, wenn sich Name oder Datum ändern.
  - `updated_at`: ISO-8601-Zeitpunkt des letzten Commits an dieser Arbeit, kann `null` sein.
- `teaser_image_url`, `thesis_url` und `avatar_url` sind immer **absolute URLs**.
- `abstract` ist Markdown.
- Enthalten sind nur Arbeiten mit `visibility: published`, sortiert nach `date` absteigend.
- Detailseiten liefert das Repo nicht. Der Proxy-Adapter soll `detail.mode: internal` setzen.

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run doctor` | Umgebung prüfen |
| `npm run validate [-- <slug>]` | Validieren |
| `npm run build` | `_site/` lokal bauen |
| `npm run image -- <bild> <slug>` | Teaserbild verarbeiten |
| `npm run slug -- <vorname> <nachname> <datum>` | Slug und Dubletten |
| `npm run supervisor -- lookup <name> \| check <slug>` | Prüfer*innen |
| `npm run sync-schema` | Schema aus mi-project-proxy aktualisieren |
| `npm test` | Validate und Build auf `examples/works` |
