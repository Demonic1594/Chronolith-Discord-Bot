#!/usr/bin/env python3
"""sync_guides — incremental BotForge guide harvester.

Uses the BotForge Developer API (public-tier key, 60 req/min) to:
  1. Detect guides approved since the last sync (new IDs)
  2. Fetch their full content and write knowledge/guides/guide-<id>.md
  3. Detect CONTENT EDITS to already-harvested guides and rewrite them
  4. Rebuild knowledge/guides/_INDEX.md

Usage:
  python3 sync_guides.py            # normal sync (new + edited guides)
  python3 sync_guides.py --check    # report only, write nothing
  python3 sync_guides.py --force    # re-fetch everything (rebuild)

Notes (verified 2026-09-29):
  - Python-urllib's default User-Agent is 403-blocked on api.botforge.org;
    this script shells out to curl (proven working) instead.
  - Public-key tier: 60 req/min. We pace at 1.15s/request (~52/min).
  - Guide content uses \r\n line endings from the API; we normalize to \n.
"""
import json
import os
import re
import subprocess
import sys
import time

API = "https://api.botforge.org/v1/guides"
# Public-tier developer key (bf_pub_ = embeddable public key by design).
KEY = "bf_pub_1a3261462bfdd6b18e02c69ff97d1f0d"
GUIDES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "guides")
PACE = 1.15  # seconds between API calls (under the 60/min tier limit)


def curl_json(url):
    for attempt in range(3):
        r = subprocess.run(
            ["curl", "-s", "-H", f"X-API-Key: {KEY}", url],
            capture_output=True, text=True, timeout=45,
        )
        try:
            d = json.loads(r.stdout)
        except json.JSONDecodeError:
            d = {"success": False, "error": f"unparseable response: {r.stdout[:120]}"}
        if d.get("success"):
            return d
        if "Too Many Requests" in str(d.get("error", "")):
            time.sleep(20 * (attempt + 1))
            continue
        raise RuntimeError(f"API error: {d.get('error')}")
    raise RuntimeError("rate-limited 3x, aborting")


def fetch_list():
    """All approved guides across pagination."""
    first = curl_json(f"{API}?limit=100&page=1")
    pages = first["pagination"]["total_pages"]
    guides = list(first["guides"])
    for p in range(2, pages + 1):
        time.sleep(PACE)
        guides.extend(curl_json(f"{API}?limit=100&page={p}")["guides"])
    return guides


def fetch_guide(gid):
    time.sleep(PACE)
    return curl_json(f"{API}?id={gid}")["guide"]


def guide_md(g, content_cache=None):
    """Render a guide JSON into the established .md format."""
    content = (g.get("content") or "").replace("\r\n", "\n").strip()
    title = (g.get("title") or
             (f"{g.get('targetName')} guide" if g.get("targetName") else "Untitled"))
    target = g.get("targetName") or "None"
    ttype = g.get("targetType") or "none"
    pkg = g.get("packageName") or "unknown"
    approved = (g.get("approvedAt") or "")[:10]
    url = g.get("url") or f"https://docs.botforge.org/guide/guide-{g['id']}"
    return (
        f"# {title}\n\n"
        f"> Community guide for `{target}` ({ttype}) — package **{pkg}**. "
        f"Approved {approved}. [View on docs.botforge.org]({url})\n\n"
        f"{content}\n"
    )


def content_of(gid):
    """Content body of a local guide file (normalized), or None."""
    p = os.path.join(GUIDES_DIR, f"guide-{gid}.md")
    if not os.path.exists(p):
        return None
    txt = open(p, encoding="utf-8").read()
    m = re.search(r"^> .*$", txt, re.M)
    return re.sub(r"\s+", " ", txt[m.end():].strip()) if m else ""


def main():
    check_only = "--check" in sys.argv
    force = "--force" in sys.argv

    listing = fetch_list()
    api_guides = {g["id"]: g for g in listing}
    print(f"API reports {len(api_guides)} approved guides")

    local_ids = sorted(
        int(m.group(1)) for f in os.listdir(GUIDES_DIR)
        if (m := re.fullmatch(r"guide-(\d+)\.md", f))
    )
    new_ids = sorted(set(api_guides) - set(local_ids))
    gone_ids = sorted(set(local_ids) - set(api_guides))
    print(f"local: {len(local_ids)} | new on API: {len(new_ids)}"
          f" | removed from API: {len(gone_ids)}")

    if check_only:
        print(f"NEW: {new_ids if new_ids else 'none'}")
        return 0 if not new_ids else 2

    fetched = 0
    # 1. new guides
    for gid in new_ids:
        g = fetch_guide(gid)
        with open(os.path.join(GUIDES_DIR, f"guide-{gid}.md"), "w", encoding="utf-8") as f:
            f.write(guide_md(g))
        print(f"  + fetched guide-{gid} ({g.get('packageName')} · "
              f"{g.get('targetType')}: {g.get('targetName')})")
        fetched += 1

    # 2. content edits to known guides (only metadata changed => skip fetch:
    #    compare approvedAt+title from listing; content check needs the full fetch)
    edited = []
    for gid in sorted(set(local_ids) & set(api_guides)):
        g = api_guides[gid]
        # cheap probe: if approvedAt differs from what our header says, re-fetch
        local_txt = open(os.path.join(GUIDES_DIR, f"guide-{gid}.md"), encoding="utf-8").read()
        m = re.search(r"Approved (\d{4}-\d{2}-\d{2})", local_txt)
        local_date = m.group(1) if m else ""
        api_date = (g.get("approvedAt") or "")[:10]
        if force or (api_date and local_date != api_date):
            full = fetch_guide(gid)
            fresh = re.sub(r"\s+", " ", (full.get("content") or "").replace("\r\n", "\n").strip())
            if force or fresh != content_of(gid):
                with open(os.path.join(GUIDES_DIR, f"guide-{gid}.md"), "w", encoding="utf-8") as f:
                    f.write(guide_md(full))
                edited.append(gid)
                fetched += 1

    if edited:
        print(f"  ~ updated edited guides: {edited}")

    # 3. rebuild the index
    all_ids = sorted(
        int(m.group(1)) for f in os.listdir(GUIDES_DIR)
        if (m := re.fullmatch(r"guide-(\d+)\.md", f))
    )
    rows = []
    for gid in all_ids:
        g = api_guides.get(gid)
        if g is None:
            # guide vanished from API but file exists — keep the row from the file header
            txt = open(os.path.join(GUIDES_DIR, f"guide-{gid}.md"), encoding="utf-8").read()
            t = txt.split("\n", 1)[0].lstrip("# ").strip()
            m = re.search(r"package \*\*(.+?)\*\*\. Approved (\S+)", txt)
            pkg, date = (m.group(1), m.group(2)) if m else ("unknown", "?")
            rows.append((pkg, date, gid, t))
        else:
            title = g.get("title") or f"{g.get('targetName') or 'Untitled'} guide"
            rows.append((g.get("packageName") or "unknown",
                         (g.get("approvedAt") or "")[:10], gid, title))
    # original convention: package ascending, date descending, id ascending
    rows.sort(key=lambda r: r[2])                      # id asc
    rows.sort(key=lambda r: r[1], reverse=True)        # date desc
    rows.sort(key=lambda r: r[0])                      # package asc

    with open(os.path.join(GUIDES_DIR, "_INDEX.md"), "w", encoding="utf-8") as f:
        f.write(f"# Community guides — index\n\n"
                f"{len(all_ids)} approved guides from docs.botforge.org, with full content.\n\n")
        for pkg, date, gid, title in rows:
            f.write(f"- [guide-{gid} — {title}](guide-{gid}.md) — {pkg} · approved {date}\n")

    print(f"done: {fetched} fetched, index rebuilt with {len(all_ids)} guides")
    return 0


if __name__ == "__main__":
    sys.exit(main())
