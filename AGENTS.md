# Anleitung für KI-Agenten: Abschlussarbeiten einpflegen

Dieses Repo ist eine Datenquelle für die Medieninformatik-Website der TH Köln. Lehrende pflegen hier mit Hilfe ihres Agenten **Abschlussarbeiten** ein. Ein Push auf `main` validiert die Arbeiten, baut daraus `index.json` und veröffentlicht sie über GitHub Pages. Der `mi-project-proxy` liest diese Datei.

Deine Aufgabe: Aus dem Material der Lehrenden (Dokumente in `_inbox/`, Diktat, Chat) einen korrekten Eintrag `works/<slug>/thesis.md` erzeugen, validieren, bestätigen lassen und pushen.

Sprich mit der Lehrenden auf Deutsch. Halte dich kurz und frag gebündelt statt Feld für Feld.

---

## Harte Regeln

1. **Nichts erfinden.** Inhalte kommen aus dem Material oder von der Lehrenden. Ausnahmen stehen ausschließlich unter „Inhaltsregeln“.
2. **Nie löschen.** Du löschst keine Arbeiten, keine Ordner und keine Dateien in `works/`. Wenn die Lehrende etwas entfernen will, sagst du ihr, dass sie das selbst tun muss. Auch `_inbox/` räumst du nicht auf.
3. **Rohmaterial kommt nie ins Repo.** `_inbox/` steht in `.gitignore`. Kopiere nie Dateien aus `_inbox/` direkt nach `works/`. Bilder laufen durch `npm run image`, PDFs werden nur nach ausdrücklicher Freigabe kopiert.
4. **Kein Push ohne grüne Validierung und ohne Bestätigung** der Lehrenden.
5. **Kein `git push --force`, kein `git reset --hard`, kein Umschreiben der Historie.**
6. **Während eines Ingests änderst du nur** `works/<slug>/` und gegebenenfalls `supervisors.json`. Schema, Skripte und Anleitung bleiben unangetastet.
7. **Andere Quellen** (Kirby, persönliche Websites, Proxy) prüfst du nicht. Dubletten suchst du nur in diesem Repo.

---

## Ablauf: neue Arbeit

### 0. Vorbereitung
- Fehlt `node_modules/`: `npm install` ausführen.
- `npm run doctor` ausführen. Bei ✗ das Problem in einfachen Worten erklären und den Fix vorschlagen.
- `git pull --rebase`, damit du auf dem aktuellen Stand arbeitest.

### 1. Material sichten
- Lies alles in `_inbox/` (PDF, Word, Markdown, Bilder, Notizen) und alles, was die Lehrende im Chat schreibt oder diktiert.
- **Interview-Modus:** Wenn kein oder wenig Material vorliegt, frag die Pflichtfelder gesprächsweise ab. Diktierte Angaben kommen oft bruchstückhaft und über mehrere Nachrichten verteilt. Sammle sie und fasse zwischendurch zusammen, was du schon weißt.
- Kannst du eine Datei nicht lesen (z. B. Audio), sag das und bitte um Text bzw. Transkript.

### 2. Felder ermitteln
Ermittle alle Felder aus `schema/thesis-schema.json`. Die Pflichtfelder sind:

| Feld | Hinweise |
|---|---|
| `title` | Exakt wie in der Arbeit, keine Umformulierung. Immer in Anführungszeichen schreiben. |
| `type` | Genau einer der Werte: `Bachelorarbeit`, `Masterarbeit`, `Praxisprojekt`, `Guided Projct`. **Achtung:** Der Tippfehler `Guided Projct` steht so im Schema und muss so geschrieben werden, solange das Schema nicht korrigiert ist. |
| `date` | Abgabedatum `YYYY-MM-DD`, in Anführungszeichen. Ist nur Monat oder Semester bekannt, frag nach. Rate nicht. |
| `status` | `in-preparation`, `in-progress`, `in-evaluation` oder `finished`. |
| `visibility` | Immer `published`. Nicht nachfragen. |
| `firstname`, `lastname` | Der Autor bzw. die Autorin. |
| `first_supervisor`, `second_supervisor` | Über `npm run supervisor -- lookup <name>` auf die volle Schreibweise normalisieren (siehe unten). |
| `teaser_image_url` | Immer `teaser.webp`. Das Bild ist Pflicht (siehe Schritt 5). |
| `teaser_image_copyright` | Immer nachfragen (siehe Schritt 5). |

Optionale Felder trägst du nur ein, wenn sie aus dem Material oder von der Lehrenden kommen: `abstract`, `keywords`, `thesis_url`, `repository_url`, `project_url`, `final_presentation_youtube_id` (nur die 11-stellige ID), `personal_website_url`, `personal_social_media_urls`, `cooperation_partner`, `cooperation_partner_url`, `awards`, `avatar_url`, `slideshow`, `research_diary`. **Andere Felder sind nicht erlaubt** (`additionalProperties: false`).

### 3. Dubletten prüfen
`npm run slug -- <vorname> <nachname> <YYYY-MM-DD>` liefert den Slug und listet vorhandene Arbeiten mit gleichem Nachnamen.
Bei einem Treffer fragst du: **„Gibt es schon (…). Aktualisieren, trotzdem neu anlegen oder abbrechen?“** Beim Aktualisieren geht es weiter mit „Ablauf: Arbeit aktualisieren“.

### 4. Prüfer*innen normalisieren
`npm run supervisor -- lookup <name>` (z. B. `Nguyen`) liefert die volle Schreibweise mit Titel. Nimm genau diese.
Ist die Person unbekannt, frag nach der vollen Schreibweise mit Titel. Biete dann an, sie in `supervisors.json` aufzunehmen (`name`, `aliases`, `git_emails` leer lassen, außer die Lehrende nennt sie).

### 5. Teaserbild und Copyright
- **Ohne Bild geht es nicht.** Liegt keins bei, frag ausdrücklich danach. Du kannst anbieten, eine Seite bzw. Abbildung aus der PDF zu rendern (`pdftoppm -png -r 150 -f <seite> -l <seite> <pdf> _inbox/seite`, falls installiert). Generiere **kein** Bild selbst.
- Gibt es mehrere Bilder, lass die Lehrende wählen.
- Verarbeiten: `npm run image -- _inbox/<bild> <slug>`. Das erzeugt `works/<slug>/teaser.webp`.
- **Copyright immer nachfragen.** Bleibt die Antwort offen oder unklar, trag `<Vorname> <Nachname>` der Autor*in ein und erwähne das in der Zusammenfassung.

### 6. PDF der Arbeit
- Eine PDF in `_inbox/` ist zunächst nur **Quelle zum Auslesen**.
- Frag ausdrücklich: **„Darf die PDF veröffentlicht werden?“**
- Bei Ja: Ist die Datei ≤ 20 MB, kopiere sie nach `works/<slug>/thesis.pdf` und setze `thesis_url: thesis.pdf`. Ist sie größer, kopierst du **nicht**. Sag der Lehrenden, dass sie die PDF komprimieren muss (z. B. mit Vorschau → „Exportieren“ → Quartz-Filter „Reduce File Size“, Acrobat oder ghostscript), und lass `thesis_url` leer, bis eine kleinere Datei vorliegt.
- Ist die PDF schon woanders öffentlich, kann `thesis_url` auch eine absolute URL sein.

### 7. Datei schreiben
`works/<slug>/thesis.md`: YAML-Frontmatter mit allen Feldern außer `abstract`, danach der Abstract als Markdown-Body.

```markdown
---
title: "Semantic Motion in Web UIs"
type: Bachelorarbeit
date: "2026-07-24"
status: finished
visibility: published
firstname: Ricardo
lastname: Timm
first_supervisor: Prof. Christian Noss
second_supervisor: Prof. Dr. Hoai Viet Nguyen
teaser_image_url: teaser.webp
teaser_image_copyright: Ricardo Timm
keywords:
  - Motion Design
  - Semiotik
---

Hier steht der Abstract als Markdown, gern mit mehreren Absätzen.
```

YAML-Fallen: `title`, `date` und alle Strings mit `:` oder `#` in Anführungszeichen setzen. Leere Felder weglassen statt `null` zu schreiben.

### 8. Validieren
`npm run validate -- <slug>`. Fehler behebst du, ohne Inhalte zu erfinden. Fehlt etwas, fragst du nach.

### 9. Zuständigkeit prüfen
`npm run supervisor -- check <slug>`. Bei `WARNUNG` weist du die Lehrende darauf hin, dass sie nicht als Prüfer*in dieser Arbeit eingetragen ist, und fragst, ob sie trotzdem weitermachen will. Bei `UNBEKANNT` geht es ohne Hinweis weiter.

### 10. Zusammenfassung und Bestätigung
Zeig der Lehrenden den kompletten Eintrag (Frontmatter und Abstract) und markiere ausdrücklich:
- **Korrekturen:** „Ich habe ‚Visualiserung‘ zu ‚Visualisierung‘ korrigiert.“
- **Selbst generierte Keywords**, falls zutreffend
- **Gekürzter Abstract**, falls zutreffend
- **Copyright-Fallback**, falls zutreffend
- ob die PDF veröffentlicht wird

Erst nach einem klaren „Ja“ geht es weiter.

### 11. Commit und Push
```bash
git add works/<slug> supervisors.json
git commit -m "Neue Arbeit: <Vorname> <Nachname> – <Kurztitel>"
git pull --rebase
git push
```
Wird der Push abgelehnt: `git pull --rebase` und erneut pushen. Bei einem echten Konflikt hältst du an und erklärst die Lage.
Danach sagst du, dass die Arbeit nach dem GitHub-Action-Lauf (ca. 1–2 Minuten) in der `index.json` steht. Erinnere daran, dass die Dateien in `_inbox/` noch dort liegen und die Lehrende sie selbst entfernen kann.

---

## Ablauf: Arbeit aktualisieren

Beispiele: „Füge bei Lisa Müller die PDF hinzu.“ „Status auf finished.“ „Sie hat den Award X bekommen.“

1. Vorbereitung wie oben (Schritt 0).
2. Die Arbeit über `npm run slug` bzw. `works/` finden. Bei mehreren Treffern nachfragen.
3. **Nur die genannten Felder ändern.** Alles andere bleibt Zeichen für Zeichen gleich.
4. Bei einem neuen Bild oder einer neuen PDF gelten die Schritte 5 und 6.
5. Validieren (Schritt 8) und Zuständigkeit prüfen (Schritt 9).
6. **Diff zeigen** (`git diff works/<slug>`) und bestätigen lassen.
7. Commit-Nachricht `Aktualisiert: <Vorname> <Nachname> – <was>`, dann `pull --rebase` und Push.

Ändert sich das Datum oder der Name, bleibt der Ordnername trotzdem unverändert. Die Validierung zeigt dann nur einen Hinweis, das ist in Ordnung.

---

## Inhaltsregeln

| Was | Erlaubt |
|---|---|
| **Keywords** | Aus dem Material übernehmen. **Nur wenn keine vorhanden sind**, darfst du 3–7 Keywords selbst vorschlagen. Diese markierst du in der Zusammenfassung als generiert. |
| **Abstract** | Wörtlich aus der Arbeit übernehmen, wenn sie einen hat (Sprache bleibt wie im Original). Ist er unverhältnismäßig lang (deutlich über ca. 1500 Zeichen), fragst du, ob du kürzen sollst. Kürzen ist nur nach Zustimmung erlaubt und heißt streichen, nicht neu formulieren. Hat die Arbeit keinen Abstract, muss er von der Lehrenden kommen. Du schreibst ihn nicht selbst. |
| **Diktierter Text** | Diktierte Abstracts und Angaben darfst du von gesprochener zu geschriebener Sprache glätten (Füllwörter, Wiederholungen, Satzbau), ohne Inhalt hinzuzufügen oder wegzulassen. Zeig das Ergebnis zur Freigabe. |
| **Rechtschreibung/Grammatik** | Offensichtliche Fehler korrigieren. Jede Korrektur nennst du in der Zusammenfassung. Bei Unsicherheit weist du nur darauf hin. |
| **Titel, Namen** | Nie umformulieren. Nur offensichtliche Tippfehler korrigieren, mit Hinweis. |
| **Prüfer*innen** | Über `supervisors.json` auf die volle Schreibweise normalisieren. |
| **Alles andere** | Kommt aus dem Material oder von der Lehrenden. Kein Übersetzen, kein Zusammenfassen, kein Ausschmücken. |

---

## Befehle

| Befehl | Zweck |
|---|---|
| `npm run doctor` | Umgebung prüfen |
| `npm run slug -- <vorname> <nachname> <datum>` | Slug erzeugen, Dubletten suchen |
| `npm run supervisor -- lookup <name>` | Prüfer*in nachschlagen |
| `npm run supervisor -- check <slug>` | Ist die eigene Git-Identität Prüfer*in der Arbeit? |
| `npm run image -- <bild> <slug>` | Teaserbild → `works/<slug>/teaser.webp` |
| `npm run validate [-- <slug>]` | Gegen Schema und Repo-Regeln prüfen |
| `npm run build` | `_site/index.json` lokal bauen (macht sonst die CI) |
