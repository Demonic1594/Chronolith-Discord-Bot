#!/usr/bin/env python3
"""Build tools/fs_metadata.json: every ForgeScript function, alias, argument and enum
from the official metadata of ForgeScript and its extensions.

fsparse.py and fslint.py read this file. It replaces scraping the knowledge-base
markdown pages: the compiler only needs names, aliases, `brackets` and each
argument's `condition`/`rest` flags, and those come straight from upstream here.

Usage:
  python3 tools/build_fs_metadata.py                    # fetch from api.botforge.org + GitHub
  python3 tools/build_fs_metadata.py --cache DIR        # use a BotForge KB cache (.knowledge-cache)
  python3 tools/build_fs_metadata.py --source-map FILE  # add experimental/deprecated flags
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent / "fs_metadata.json"
REGISTRY_URL = "https://api.botforge.org/v1/extensions"
# Off-registry package used in production bots (see the KB's extensions/edge/README.md).
EXTRA_PACKAGES = [{
    "packageName": "Edge",
    "npm": "@quoriel/edge",
    "functionsUrl": "https://raw.githubusercontent.com/quoriel/edge/main/metadata/functions.json",
    "enumsUrl": "https://raw.githubusercontent.com/quoriel/edge/main/metadata/enums.json",
    "eventsUrl": None,
}]


def fetch_json(url):
    # api.botforge.org answers 403 to urllib's default User-Agent
    req = urllib.request.Request(url, headers={"User-Agent": "chronolith-fslint/5"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.load(r)


def load_packages(cache):
    if cache:
        reg = json.load(open(Path(cache) / "meta" / "_registry.json"))
    else:
        reg = fetch_json(REGISTRY_URL)["extensions"]
    pkgs = []
    for e in reg:
        owner = e.get("npmPackageOwner")
        npm = e.get("npmPackageName")
        pkgs.append({
            "packageName": e["packageName"],
            "npm": (f"@{owner}/{npm}" if owner else npm) if npm else None,
            "functionsUrl": e.get("functionsUrl"),
            "enumsUrl": e.get("enumsUrl"),
            "eventsUrl": e.get("eventsUrl"),
        })
    return pkgs + EXTRA_PACKAGES


def read_resource(pkg, key, cache):
    if cache and pkg["packageName"] != "Edge":
        p = Path(cache) / "meta" / f"{pkg['packageName']}__{key}.json"
        return json.load(open(p)) if p.exists() else None
    url = pkg.get(key)
    if not url:
        return None
    try:
        return fetch_json(url)
    except Exception as ex:  # a package without enums/events is normal
        print(f"  {pkg['packageName']} {key}: {ex}", file=sys.stderr)
        return None


def slim_arg(a):
    out = {
        "name": a.get("name"),
        "type": a.get("type"),
        "required": bool(a.get("required")),
        "rest": bool(a.get("rest")),
    }
    if a.get("condition"):
        out["condition"] = True
    if a.get("enumName"):
        out["enum"] = a["enumName"]
    if a.get("enum") and not a.get("enumName"):
        out["enumValues"] = a["enum"]
    if a.get("pointer") is not None:
        out["pointer"] = a["pointer"]
    if a.get("description"):
        out["description"] = a["description"]
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cache", help="BotForge .knowledge-cache directory (offline build)")
    ap.add_argument("--source-map", help="source_map.json from the KB harvester (experimental/deprecated flags)")
    opts = ap.parse_args()

    flags = json.load(open(opts.source_map)) if opts.source_map else {}
    packages, functions, enums, events = [], [], {}, {}
    for pkg in load_packages(opts.cache):
        name = pkg["packageName"]
        fns = read_resource(pkg, "functionsUrl", opts.cache) or []
        ens = read_resource(pkg, "enumsUrl", opts.cache) or {}
        evs = read_resource(pkg, "eventsUrl", opts.cache) or []
        src = flags.get(name, {})
        for f in fns:
            info = src.get(f["name"], {})
            functions.append({
                "name": f["name"],
                "package": name,
                "aliases": f.get("aliases") or [],
                # null = the compiler gives the function no fields at all ("[...]" after it is text)
                "brackets": f.get("brackets"),
                "unwrap": bool(f.get("unwrap")),
                "category": f.get("category"),
                "version": f.get("version"),
                "output": f.get("output"),
                "description": f.get("description"),
                "experimental": bool(info.get("experimental")),
                "deprecated": bool(info.get("deprecated")),
                "args": [slim_arg(a) for a in (f.get("args") or [])],
            })
        if isinstance(ens, dict):
            for en, vals in ens.items():
                enums.setdefault(en, vals)
        events[name] = [e.get("name") for e in evs if isinstance(e, dict)]
        packages.append({"name": name, "npm": pkg["npm"], "functions": len(fns)})
        print(f"{name}: {len(fns)} functions", file=sys.stderr)

    out = {"packages": packages, "functions": functions, "enums": enums, "events": events}
    OUT.write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    print(f"-> {OUT} ({len(functions)} functions, {len(enums)} enums, {OUT.stat().st_size // 1024} KB)", file=sys.stderr)


if __name__ == "__main__":
    main()
