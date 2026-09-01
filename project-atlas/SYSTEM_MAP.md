# Systemkarte – repo-übergreifende Architektur

> Diese Karte dokumentiert Arbeitsprinzipien und Produktlinien. Sie ist eine fortsetzbare Projektion, keine kanonische Ontologie.

## Leitfrage

**Was darf erscheinen – und als was darf es gelten?**

Die gemeinsame Bewegung liegt vor der vorschnellen Einordnung. Material wird empfangen, seine Herkunft bleibt erhalten, und erst danach werden Beziehungen, Geltungsräume oder Handlungen vorgeschlagen. Daraus folgen die Sätze:

- **Empfang vor Geltung.**
- **Wirklichkeit wird nicht abgespielt. Sie wird fortgesetzt.**
- **Fortsetzung verändert Fortsetzbarkeit.**

## Kernarchitektur

### 1. Keine kanonische Textbasis

Weder Vault, Datenbank noch zusammengeführtes Dokument darf als verborgene eigentliche Wahrheit fungieren. Stabil gehalten werden:

- unveränderte Ausgangsmaterialien,
- ihre Fassungen,
- Ereignisse und Transformationen,
- die Herkunft jeder Veränderung,
- der jeweils erklärte Status einer Aussage oder Beziehung.

Eine Datenbank darf indexieren. Eine Projektion darf ordnen. Eine menschliche Freigabe darf Fortsetzung verantworten. Nichts davon macht einen Textbestand an sich wahr.

### 2. Human Seal

Ein Human Seal bedeutet nicht: „Diese Aussage ist wahr.“ Es bedeutet: „Diese Fassung oder Relation darf in diesem erklärten Zusammenhang als verantwortbare Fortsetzungsgrundlage dienen.“ Geltungsraum, Urheber, Zeitpunkt und Revisionsmöglichkeit bleiben sichtbar.

### 3. Gateway und Moduspflicht

Jeder Lauf soll Akteur, Rolle, Modus, Absicht, erreichbare Räume und erlaubte Schreiboperationen erklären. Die Arbeitsmodi sind:

| Modus | Pflicht |
|---|---|
| Capture | aufnehmen, ohne umzudeuten |
| Continue | Bestand suchen und lesen, bevor angeschlossen wird |
| Transform | exakte Quellstellen und Transformationsbeziehung nennen |
| Relate | Beziehung mit Urheber, Grundlage, Sicherheit und Geltungsraum vorschlagen |
| Integrate | Varianten, Widersprüche und Herkunft sichtbar zusammenführen |
| Act | operative Handlung klar von Erkenntnisarbeit trennen |
| Project | Ansicht erzeugen, ohne sie zum Kanon zu erklären |

### 4. Leitstand, Preflight und Abschlussbeleg

Vor Schreiben, Bauen oder Agentenstart werden Bestand, Quellen, offene Fragen, Fortsetzungsziel und aktuelle Arbeitsfront geprüft. Danach wird nicht nur ein Ergebnis, sondern auch sein Anschluss dokumentiert: veränderte Dateien, neue Objekte, Relationen, Git-Stand und Auswirkungen auf die Working Front.

### 5. Drei tragende Ereignistypen

- **ExposureEvent:** Was wurde welcher Instanz tatsächlich gezeigt?
- **ContextManifest:** Welche Quellen und Ausschnitte wurden gewählt oder ausgeschlossen?
- **RelationAssertion:** Welche Beziehung wurde von wem, auf welcher Grundlage, mit welcher Sicherheit und welchem Status vorgeschlagen?

## Produkt- und Methodenlinien

### Empfang vor Geltung

Material darf zunächst erscheinen, ohne sofort als wahr, typisch, diagnostisch, kanonisch oder handlungsleitend festgelegt zu werden.

**Schutz- bzw. Arbeitsregeln:** Beobachtung ≠ Eigenschaft · Phänomen ≠ Diagnose · Ähnlichkeit ≠ Zugehörigkeit · Nicht gezeigt ≠ nicht vorhanden

**Verbundene Repositories:** [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`adhs-us-entdeckungsraum`](https://github.com/ralfarminkirchner-netizen/adhs-us-entdeckungsraum), [`faska-lernlandschaft`](https://github.com/ralfarminkirchner-netizen/faska-lernlandschaft), [`neuro-psych-map`](https://github.com/ralfarminkirchner-netizen/neuro-psych-map)

### Keine kanonische Textbasis

Weder Vault, Datenbank noch Sammeldokument ist „die Wahrheit“. Stabil gehalten werden Originalquellen, Fassungen, Ereignisse, Herkunft und deklarierte Status.

**Schutz- bzw. Arbeitsregeln:** Originale unverändert halten · Fassungen statt Überschreiben · Status explizit deklarieren · Projektionen sind Ansichten, keine Wahrheitsspeicher

**Verbundene Repositories:** [`inventur-werkstatt`](https://github.com/ralfarminkirchner-netizen/inventur-werkstatt), [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`mindgarden`](https://github.com/ralfarminkirchner-netizen/mindgarden), [`mindlaxy`](https://github.com/ralfarminkirchner-netizen/mindlaxy)

### Human Seal

Eine menschliche Freigabe macht eine Aussage nicht wahr; sie erklärt sie für einen bestimmten Zusammenhang als verantwortbare Fortsetzungsgrundlage.

**Schutz- bzw. Arbeitsregeln:** Autonomie ≠ Autorität · Freigabe ist kontextgebunden · Revisionsfähigkeit bleibt erhalten

**Verbundene Repositories:** [`aithentisch-tisch`](https://github.com/ralfarminkirchner-netizen/aithentisch-tisch), [`inkarnat`](https://github.com/ralfarminkirchner-netizen/inkarnat), [`mindgarden`](https://github.com/ralfarminkirchner-netizen/mindgarden), [`mindlaxy`](https://github.com/ralfarminkirchner-netizen/mindlaxy), [`ki-ntegrity-v1`](https://github.com/ralfarminkirchner-netizen/ki-ntegrity-v1)

### Gateway und Moduspflicht

Jeder Lauf erklärt Akteur, Rolle, Modus, Absicht, erreichbare Räume und erlaubte Schreiboperationen. Unterschieden werden Capture, Continue, Transform, Relate, Integrate, Act und Project.

**Schutz- bzw. Arbeitsregeln:** Eintritt und Ausgang sind Ereignisse · Keine stillen Schreibwege · Transformationen verweisen auf exakte Quellstellen

**Verbundene Repositories:** [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`inventur-werkstatt`](https://github.com/ralfarminkirchner-netizen/inventur-werkstatt), [`claude-obsidian`](https://github.com/ralfarminkirchner-netizen/claude-obsidian), [`llm-wiki`](https://github.com/ralfarminkirchner-netizen/llm-wiki)

### Leitstand, Preflight und Laufzwang

Vor Bauen oder Schreiben müssen Bestand, Quellen, offene Fragen, Fortsetzungsziel und Arbeitsfront gelesen werden. Abschlussbelege dokumentieren Dateien, Relationen und veränderte Arbeitsfronten.

**Schutz- bzw. Arbeitsregeln:** Lesen vor Bauen · Vorhandenes benutzen oder begründet fortsetzen · Kein unbegründeter Parallelbau

**Verbundene Repositories:** [`inventur-werkstatt`](https://github.com/ralfarminkirchner-netizen/inventur-werkstatt), [`inventur-tiefe`](https://github.com/ralfarminkirchner-netizen/inventur-tiefe), [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`autonomy-workbench`](https://github.com/ralfarminkirchner-netizen/autonomy-workbench)

### ExposureEvent, ContextManifest und RelationAssertion

Das System hält fest, was einer Instanz gezeigt wurde, welchen Kontext sie auswählte und welche Beziehung sie mit welcher Grundlage, Sicherheit und Geltung vorschlägt.

**Schutz- bzw. Arbeitsregeln:** Herkunftspflicht · Claim Ceiling · Ausschlüsse sichtbar machen

**Verbundene Repositories:** [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`mindgarden`](https://github.com/ralfarminkirchner-netizen/mindgarden), [`aithentisch-tisch`](https://github.com/ralfarminkirchner-netizen/aithentisch-tisch), [`erkenntnisgefuege`](https://github.com/ralfarminkirchner-netizen/erkenntnisgefuege)

### Projektionen statt verborgenem Zweitsystem

Arbeitsfront, Buch, Lernlandschaft, Phänomenraum, Zeitlinie oder Planner sind regenerierbare Ansichten auf Quellen, Ereignisse und Relationen – kein unsichtbarer eigentlicher Datenapparat hinter dem Arbeitsraum.

**Schutz- bzw. Arbeitsregeln:** Obsidian bleibt menschlicher Arbeitsraum · Indizes sind ableitbar · Ansichten dürfen einander widersprechen

**Verbundene Repositories:** [`mindlaxy2-vault`](https://github.com/ralfarminkirchner-netizen/mindlaxy2-vault), [`mindgarden`](https://github.com/ralfarminkirchner-netizen/mindgarden), [`faska-lernlandschaft`](https://github.com/ralfarminkirchner-netizen/faska-lernlandschaft), [`spiral-mind-timeline`](https://github.com/ralfarminkirchner-netizen/spiral-mind-timeline)

### Querleser

Ein Leseraum, in dem Originaltext und gewählte KI-Gegenleser nebeneinanderstehen. Vorschläge erscheinen erst nach einer menschlichen Auswahl; Vertiefungen können in den Vault übergehen.

**Schutz- bzw. Arbeitsregeln:** Original zuerst · Keine ungefragten KI-Vorschläge · Modellwahl folgt der Sitzbestimmung

**Verbundene Repositories:** [`claude-obsidian`](https://github.com/ralfarminkirchner-netizen/claude-obsidian), [`aithentisch-tisch`](https://github.com/ralfarminkirchner-netizen/aithentisch-tisch), [`moonfingers`](https://github.com/ralfarminkirchner-netizen/moonfingers)

### Funkenfänger

Erfasst Ideenfunken aus Notizen und Chats mit Sprecher-, Zeit-, Kontext- und Herkunftsangaben und hält fremde Chats als Quellen statt als gegenwärtige Stimme.

**Schutz- bzw. Arbeitsregeln:** Append-only Capture · Vollständige Rückführbarkeit · Keine Sprechervermischung

**Verbundene Repositories:** [`mindlaxy-brainstorm-hunter`](https://github.com/ralfarminkirchner-netizen/mindlaxy-brainstorm-hunter), [`brainstorm-spiral`](https://github.com/ralfarminkirchner-netizen/brainstorm-spiral), [`BRaiNSTORMZ`](https://github.com/ralfarminkirchner-netizen/BRaiNSTORMZ), [`mitschrift-ops`](https://github.com/ralfarminkirchner-netizen/mitschrift-ops)

### Entwicklungsgarten

Eine lern- und entwicklungsorientierte Dokumentation mit Gartenmetapher: Lernspuren wachsen, Unterstützungen und Bedingungen bleiben sichtbar, und schwierige Ereignisse werden nicht zu festen Eigenschaften eines Kindes.

**Schutz- bzw. Arbeitsregeln:** Handlung unter Bedingungen ≠ Eigenschaft · Keine Gelegenheit ≠ negative Evidenz · Mit Unterstützung gezeigt ≠ unabhängig generalisiert

**Verbundene Repositories:** [`faska-lernlandschaft`](https://github.com/ralfarminkirchner-netizen/faska-lernlandschaft), [`faska-eigenraum`](https://github.com/ralfarminkirchner-netizen/faska-eigenraum), [`faska-eine-app`](https://github.com/ralfarminkirchner-netizen/faska-eine-app), [`mindgarden`](https://github.com/ralfarminkirchner-netizen/mindgarden)

### Offener Neurodivergenz-Phänomenatlas

Phänomene stehen im Zentrum; Diagnosen, Ursachen, Häufigkeiten und persönliche Passung bleiben getrennte Relationsarten. Persönliche Daten sind vom öffentlichen Wissensraum getrennt.

**Schutz- bzw. Arbeitsregeln:** Phänomen ≠ Diagnose · Zusammenhang ≠ Ursache · Hilft einigen ≠ hilft dir · Kein Treffer ≠ nicht vorhanden

**Verbundene Repositories:** [`adhs-us-entdeckungsraum`](https://github.com/ralfarminkirchner-netizen/adhs-us-entdeckungsraum), [`neuro-psych-map`](https://github.com/ralfarminkirchner-netizen/neuro-psych-map), [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`adhsos-dynamik-instrument`](https://github.com/ralfarminkirchner-netizen/adhsos-dynamik-instrument)

### ResearchRun und Evidenzprofil

Rechercheläufe protokollieren Frage, Datum, Suchvarianten, Ein- und Ausschlüsse, Volltextstatus, Quellentyp, Methode, Kausalstärke, Widersprüche, Grenzen und Interessenkonflikte.

**Schutz- bzw. Arbeitsregeln:** Rechercheweg sichtbar · Gegenrecherche verpflichtend · Sprachstärke folgt Evidenzstärke

**Verbundene Repositories:** [`ADHSOS_Core`](https://github.com/ralfarminkirchner-netizen/ADHSOS_Core), [`adhs-us-entdeckungsraum`](https://github.com/ralfarminkirchner-netizen/adhs-us-entdeckungsraum), [`spiral-wiki-app`](https://github.com/ralfarminkirchner-netizen/spiral-wiki-app)

### AiTHENTiSCH und organisierte Alterität

Mehrere Modelle erzeugen getrennte Lesarten. Konsens wird nicht mit Wahrheit verwechselt; Interferenz und Unbeantwortetes bleiben als eigene Ergebnisse erhalten.

**Schutz- bzw. Arbeitsregeln:** Contested ist ein zulässiger Endzustand · Keine Geltungsenteignung durch Rechtgeben · Rohantworten bleiben erhalten

**Verbundene Repositories:** [`ki_tisch_mvp`](https://github.com/ralfarminkirchner-netizen/ki_tisch_mvp), [`der-tisch`](https://github.com/ralfarminkirchner-netizen/der-tisch), [`aithentisch-tisch`](https://github.com/ralfarminkirchner-netizen/aithentisch-tisch), [`Aithentik-Alpha-Loop`](https://github.com/ralfarminkirchner-netizen/Aithentik-Alpha-Loop)

### AiTHENTiSCH · KiNTEGRiTY · Differenztragfähigkeit

Systeme sollen Unterschiede tragen, ohne sie vorschnell aufzulösen. Nichtausschöpfbarkeit, Herkunftspflicht, Recht auf Opazität und Revisionsfähigkeit begrenzen jede Synthese.

**Schutz- bzw. Arbeitsregeln:** Nichtausschöpfbarkeit · Herkunftspflicht · Claim Ceiling · Recht auf Opazität · Revisionsfähigkeit

**Verbundene Repositories:** [`ki-ntegrity-v1`](https://github.com/ralfarminkirchner-netizen/ki-ntegrity-v1), [`moonfingers`](https://github.com/ralfarminkirchner-netizen/moonfingers), [`inkarnat`](https://github.com/ralfarminkirchner-netizen/inkarnat), [`aithentisch-tisch`](https://github.com/ralfarminkirchner-netizen/aithentisch-tisch)

### Schwellenphilosophie und Invarianz

Die Untersuchung setzt vor festgelegten Disziplinen und Erscheinungsformen an: Was darf erscheinen, als was darf es gelten, und was bleibt durch wechselnde Erscheinungen hindurch überhaupt bestimmbar?

**Schutz- bzw. Arbeitsregeln:** Die Erscheinung ist nicht mit ihrer Deutung identisch · Invarianten sind keine bloßen wiederkehrenden Inhalte · Erkennen verändert Fortsetzbarkeit

**Verbundene Repositories:** [`invarianz-instrument`](https://github.com/ralfarminkirchner-netizen/invarianz-instrument), [`erkenntnisgefuege`](https://github.com/ralfarminkirchner-netizen/erkenntnisgefuege), [`moonfingers`](https://github.com/ralfarminkirchner-netizen/moonfingers), [`schwellen`](https://github.com/ralfarminkirchner-netizen/schwellen), [`DEiN-SEiN`](https://github.com/ralfarminkirchner-netizen/DEiN-SEiN)

## Grenzen zwischen wichtigen Projekten

- **MiNDLAXY** ist die filmische Gesamtwelt; **MiNDGARDEN** ist ein eigenständiger Arbeitsraum für belegte Quellspuren.
- **MOONFiNGERS** vergleicht Denklandschaften; es ist weder Wissenslexikon noch Synkretismusmaschine.
- **SCHWELLEN** ist ein Erwachsenenprojekt; **Weltretten in klein** und **Einhorn 64** sind eigenständige Kinderprodukte.
- **inventur-werkstatt** darf ordnen und Vorschläge verwalten; **inventur-tiefe** liest und prüft bewusst schreibgeschützt.
- **Neuro-Psych Map** und der Phänomenatlas visualisieren bzw. ordnen Phänomene; sie diagnostizieren keine Person.

## Werte- und Sicherheitsrahmen

**AiTHENTiSCH · KiNTEGRiTY · Differenztragfähigkeit** bilden den gemeinsamen Rahmen. Dazu gehören Nichtausschöpfbarkeit, Herkunftspflicht, Claim Ceiling, Recht auf Opazität und Revisionsfähigkeit. Wo Quellen widersprechen, darf „contested“ ein Endzustand sein.

## Fortsetzung durch andere Instanzen

Die operative Reihenfolge steht in [`INSTANCE_HANDOVER.md`](INSTANCE_HANDOVER.md). Der wichtigste Grundsatz lautet: **Nicht vom Namen in den Bau springen. Erst den vorhandenen Träger, seine aktuelle Fassung, seine Quellen und seine erklärten Grenzen lesen.**
