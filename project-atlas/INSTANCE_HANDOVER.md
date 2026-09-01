# Handover für andere KI-Instanzen

## Zweck

Dieser Ordner ist der öffentliche Einstieg in RAKis App-, Forschungs- und Systembestand. Er soll verhindern, dass eine neue Instanz vorhandene Arbeit übersieht, Repository-Namen verwechselt, private Inhalte exponiert oder einen weiteren parallelen „eigentlichen“ Kern baut.

**Snapshot:** 2026-09-01  
**GitHub-Konto:** `ralfarminkirchner-netizen`  
**Beobachteter Bestand:** 92 Repositories, davon 30 öffentlich und 62 privat.

## Verbindliche Lesereihenfolge

1. [`README.md`](README.md) – Umfang, Familien und vollständiger Index.
2. [`projects.json`](projects.json) – maschinenlesbare Repository-, Evidenz- und Relationsdaten.
3. [`SYSTEM_MAP.md`](SYSTEM_MAP.md) – repo-übergreifende Architektur und Schutzregeln.
4. Das README, die aktuellen Branches und die relevanten Dateien des konkreten Ziel-Repositories.
5. Erst danach: Fortsetzungsvorschlag, Änderung oder neue Implementierung.

## Was die Felder bedeuten

- `visibility`, `default_branch` und `github_size_kb` stammen aus der beobachteten GitHub-Messung.
- `primary_family` und `status` im Zentralindex sind eine dokumentierte Klassifikationsprojektion; Kurzbeschreibungen, Rollen und Relationen liegen in den verlinkten Familien-JSON-Dateien.
- `evidence` benennt, worauf die Zusammenfassung beruht.
- `confidence` ist die Sicherheit dieser Zuordnung, **nicht** die Qualität des Projekts.
- `private` bedeutet: Die Existenz und eine allgemeine Beschreibung sind im Atlas sichtbar; der Inhalt bleibt zugriffsgeschützt.

## Vor jeder Fortsetzung

Erzeuge einen kurzen Startbeleg mit:

```yaml
target_repository:
target_branch:
continuation_target:
sources_read:
exact_paths_read:
related_projects_checked:
existing_solution:
  state: use | continue | repair | related-different-purpose | not-found
open_question:
write_scope:
privacy_scope:
claim_ceiling:
```

Eine Änderung ohne gelesenen Bestand ist kein Anschluss, sondern ein Parallelbau.

## Entscheidungsregel

| Befund | Handlung |
|---|---|
| Vorhanden und passend | benutzen |
| Teilweise vorhanden | fortsetzen oder reparieren |
| Verwandt, aber anderer Zweck | Relation dokumentieren und getrennt lassen |
| Veraltet oder defekt | reparieren, Herkunft erhalten |
| Nicht vorhanden | neu bauen und Nichtvorhandensein begründen |

## Strikte Nicht-Gleichsetzungen

- Repository ≠ Projekt
- Dateiname ≠ Geltungsstatus
- Ähnlicher Name ≠ Variante oder Nachfolger
- Öffentlicher Build ≠ private Quellfassung
- Vorschlag ≠ menschliche Setzung
- Human Seal ≠ Wahrheit
- Beobachtung ≠ Eigenschaft
- Phänomen ≠ Diagnose
- Projektion ≠ kanonischer Bestand

## Schreibregeln

1. Keine stillen Überschreibungen von Quellen oder menschlichen Fassungen.
2. Neue Modellinhalte als neue Fassung, Vorschlag, Relation oder Ereignis anlegen.
3. Exakte Quellstellen und Transformationsart festhalten.
4. Private Repositories oder personenbezogene Materialien nicht durch öffentliche Zusammenfassungen rekonstruieren.
5. Keine Zugangsdaten, lokale absolute Pfade, private Volltexte oder identifizierenden Falldaten in den öffentlichen Atlas schreiben.
6. Bei widersprüchlichen Varianten nicht glätten; Unterschiede und offene Entscheidung sichtbar lassen.
7. Nach Änderungen Atlas und Zielrepo nicht automatisch für „kanonisch“ erklären.

## Abschlussbeleg

```yaml
git_commit:
changed_paths:
new_objects:
changed_objects:
relations_added:
working_front_change:
projection_updated:
tests_or_checks:
remaining_uncertainty:
human_seal_required:
```

## Repository-Synchronisation auf einem anderen Rechner

Das Werkzeug [`sync_repositories.py`](sync_repositories.py) liest ausschließlich das Register. Ohne `--apply` zeigt es nur an, was es tun würde.

Öffentliche Repositories trocken prüfen:

```bash
python3 project-atlas/sync_repositories.py --visibility public
```

Öffentliche Repositories flach klonen oder aktualisieren:

```bash
python3 project-atlas/sync_repositories.py \
  --visibility public \
  --root "$HOME/RAKi-Apps" \
  --apply
```

Alle Repositories mit bereits eingerichtetem GitHub-Zugriff:

```bash
python3 project-atlas/sync_repositories.py \
  --visibility all \
  --root "$HOME/RAKi-Apps" \
  --apply
```

Das Skript speichert keine Tokens. Private Repositories funktionieren nur über die auf dem Rechner bereits eingerichtete Git-/GitHub-Authentifizierung.

## Offene Inventurgrenze

Dieser Snapshot ist vollständig für die am Stichtag sichtbare GitHub-Eigentümerliste. Er beweist nicht, dass jeder lokale Projektordner gepusht wurde. Eine lokale Platteninventur muss später gegen `repository_full_name`, Remote-URL und Arbeitsbaum abgeglichen werden; bis dahin bleibt `local_only_coverage: not measured` bestehen.
