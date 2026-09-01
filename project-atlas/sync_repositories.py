#!/usr/bin/env python3
"""Clone or update repositories listed in the RAKi project atlas.

Safe defaults:
- dry run unless --apply is given
- public repositories only unless --visibility all/private is selected
- shallow clones unless --full-history is given
- never stores credentials
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


def load_registry(path: Path) -> tuple[str, list[dict[str, Any]]]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        raise SystemExit(f"Register nicht gefunden: {path}")
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Ungültiges JSON in {path}: {exc}") from exc

    owner = data.get("snapshot", {}).get("owner") or data.get("owner")
    projects = data.get("projects")
    if not isinstance(owner, str) or not owner:
        raise SystemExit("Das Register enthält keinen gültigen GitHub-Owner.")
    if not isinstance(projects, list):
        raise SystemExit("Das Register enthält kein gültiges projects-Array.")
    return owner, projects


def selected(project: dict[str, Any], visibility: str) -> bool:
    current = project.get("visibility")
    if visibility == "all":
        return current in {"public", "private"}
    return current == visibility


def run_command(command: list[str], apply: bool) -> int:
    printable = " ".join(subprocess.list2cmdline([part]) for part in command)
    print(("[APPLY] " if apply else "[DRY]   ") + printable)
    if not apply:
        return 0
    result = subprocess.run(command, check=False)
    return result.returncode


def sync_repository(
    owner: str,
    project: dict[str, Any],
    root: Path,
    apply: bool,
    full_history: bool,
    pull_existing: bool,
) -> tuple[str, str]:
    name = project["name"]
    clone_url = f"https://github.com/{owner}/{name}.git"
    branch = project.get("default_branch") or "main"
    target = root / name

    if not target.exists():
        command = ["git", "clone"]
        if not full_history:
            command.extend(["--depth", "1"])
        command.extend(["--branch", branch, "--single-branch", clone_url, str(target)])
        code = run_command(command, apply)
        if not apply:
            return name, "would-clone"
        return name, "cloned" if code == 0 else f"clone-failed:{code}"

    if not (target / ".git").exists():
        print(f"[SKIP]  {target} existiert, ist aber kein Git-Repository.", file=sys.stderr)
        return name, "target-not-git"

    if not pull_existing:
        print(f"[KEEP]  {target} existiert; Aktualisierung ist mit --no-pull deaktiviert.")
        return name, "kept-existing"

    fetch = ["git", "-C", str(target), "fetch", "origin", branch]
    code = run_command(fetch, apply)
    if code != 0:
        return name, f"fetch-failed:{code}"

    pull = ["git", "-C", str(target), "pull", "--ff-only", "origin", branch]
    code = run_command(pull, apply)
    if not apply:
        return name, "would-update"
    return name, "updated" if code == 0 else f"pull-failed:{code}"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="RAKi-Repositories aus project-atlas/projects.json klonen oder aktualisieren."
    )
    parser.add_argument(
        "--registry",
        type=Path,
        default=Path(__file__).with_name("projects.json"),
        help="Pfad zum Atlas-Register (Standard: projects.json neben diesem Skript).",
    )
    parser.add_argument(
        "--root",
        type=Path,
        default=Path.home() / "RAKi-Apps",
        help="Zielordner (Standard: ~/RAKi-Apps).",
    )
    parser.add_argument(
        "--visibility",
        choices=("public", "private", "all"),
        default="public",
        help="Welche Repositories berücksichtigt werden.",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Befehle wirklich ausführen. Ohne diese Option bleibt alles ein trockener Lauf.",
    )
    parser.add_argument(
        "--full-history",
        action="store_true",
        help="Vollständige Git-Historie klonen. Standard sind platzsparende shallow clones.",
    )
    parser.add_argument(
        "--no-pull",
        action="store_true",
        help="Vorhandene Repositories nicht aktualisieren.",
    )
    parser.add_argument(
        "--include-empty-shells",
        action="store_true",
        help="Auch ausdrücklich als empty-shell markierte Repositories berücksichtigen.",
    )
    args = parser.parse_args()

    owner, projects = load_registry(args.registry)
    chosen = [
        project
        for project in projects
        if selected(project, args.visibility)
        and (args.include_empty_shells or project.get("status") != "empty-shell")
    ]

    print(
        f"Register: {args.registry}\n"
        f"Owner:    {owner}\n"
        f"Ziel:     {args.root}\n"
        f"Auswahl:  {len(chosen)} Repositories ({args.visibility})\n"
        f"Modus:    {'AUSFÜHREN' if args.apply else 'TROCKENLAUF'}\n"
    )

    if args.apply:
        args.root.mkdir(parents=True, exist_ok=True)

    outcomes: list[tuple[str, str]] = []
    for project in sorted(chosen, key=lambda item: item["name"].lower()):
        outcomes.append(
            sync_repository(
                owner=owner,
                project=project,
                root=args.root,
                apply=args.apply,
                full_history=args.full_history,
                pull_existing=not args.no_pull,
            )
        )

    failures = [item for item in outcomes if "failed" in item[1] or item[1] == "target-not-git"]
    print("\nZusammenfassung:")
    for name, outcome in outcomes:
        print(f"- {name}: {outcome}")

    if failures:
        print(f"\n{len(failures)} Vorgänge benötigen Prüfung.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
