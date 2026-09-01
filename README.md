# AiTHENTiSCGH

Dieses Repository enthält zwei **getrennte** Bereiche:

1. **AiTHENTiSCGH / MiNDCEL-Graph** – eine Next.js-Anwendung für einen zeitlich und thematisch filterbaren 3D-Wissensgraphen.
2. **RAKi Projektatlas** – eine öffentliche, menschen- und maschinenlesbare Projektion des App- und Systembestands.

## RAKi Projektatlas

**[Zum Projektatlas](project-atlas/README.md)**

Der Atlas dokumentiert den am **1. September 2026** über das authentifizierte GitHub-Konto gemessenen Bestand:

- **92** eigene Repositories
- **30** öffentlich
- **62** privat
- zusätzlich eine [Systemkarte](project-atlas/SYSTEM_MAP.md) der repo-übergreifenden Konzepte
- ein [Handover für andere KI-Instanzen](project-atlas/INSTANCE_HANDOVER.md)
- das [maschinenlesbare Register](project-atlas/projects.json)
- ein [Synchronisationswerkzeug](project-atlas/sync_repositories.py) für einen zweiten Rechner

Der Atlas ist **keine kanonische Wahrheit**. GitHub-Metadaten, gelesene Quellen und interpretierte Zuordnungen werden getrennt ausgewiesen. Ähnliche Namen werden nicht automatisch zu einem einzigen Produkt zusammengezogen.

## AiTHENTiSCGH lokal starten

```bash
npm install
npm run dev
```

Danach im Browser öffnen:

```text
http://localhost:3000
```

Der bestehende Graph lädt seine Knoten und Relationen aus `public/data.json`. Der Projektatlas liegt als separate Dokumentationsschicht unter `project-atlas/` und verändert den Graphbestand nicht.

## Wichtige Grenze

Der GitHub-Snapshot erfasst alle Repositories, die am Stichtag mit Eigentümer-Zugehörigkeit sichtbar waren. **Nur lokal vorhandene, nie zu GitHub gepushte Ordner konnten in dieser Sitzung nicht gemessen werden.** Diese Grenze steht auch im Register und darf von späteren Instanzen nicht stillschweigend überschrieben werden.
