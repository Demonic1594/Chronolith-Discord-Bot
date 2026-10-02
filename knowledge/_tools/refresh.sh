#!/usr/bin/env bash
# Refresh the knowledge base end-to-end.
#
#   1. registry + raw metadata   (BotForge Developer API + raw.githubusercontent.com — fast, no hard rate limit)
#   2. guides                    (API, rate-limited: 5 req/min anonymous tier — takes ~20 min for all guides)
#   3. source harvest            (requires shallow clones of the package repos in /tmp/opencode)
#   4. regenerate knowledge/
#
# Usage: bash knowledge/_tools/refresh.sh [--skip-guides]
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CACHE="$ROOT/.knowledge-cache"
mkdir -p "$CACHE/guides" "$CACHE/meta"

echo "== 1. registry + metadata =="
curl -sS -m 30 "https://api.botforge.org/v1/extensions" -o "$CACHE/_extensions.json"
python3 - "$CACHE" <<'EOF'
import json, subprocess, os, sys, time
cache = sys.argv[1]
d = json.load(open(f'{cache}/_extensions.json'))
exts = d.get('extensions') or []
json.dump(exts, open(f'{cache}/meta/_registry.json', 'w'), indent=1)
for e in exts:
    pkg = e.get('packageName') or e['githubPackageName']
    for key in ('functionsUrl','eventsUrl','enumsUrl','changelogsUrl','readmeBaseUrl'):
        url = e.get(key)
        if not url: continue
        dest = f'{cache}/meta/{pkg}__{key}.json' if key != 'readmeBaseUrl' else f'{cache}/meta/{pkg}__readme.md'
        if os.path.exists(dest): continue
        subprocess.run(['curl','-sSL','-m','60','--fail',url,'-o',dest], capture_output=True)
        time.sleep(0.3)
print('metadata cached')
EOF

if [ "${1:-}" != "--skip-guides" ]; then
  echo "== 2. guides (rate-limited, ~20 min) =="
  curl -sS -m 30 "https://api.botforge.org/v1/guides?limit=100" -o "$CACHE/_guides_list.json"
  python3 - "$CACHE" <<'EOF'
import json, sys
cache = sys.argv[1]
json.load(open(f'{cache}/_guides_list.json'))
EOF
  ids=$(python3 -c "import json;print(' '.join(str(g['id']) for g in json.load(open('$CACHE/_guides_list.json'))['guides']))")
  for id in $ids; do
    out="$CACHE/guides/guide-$id.json"
    [ -s "$out" ] && continue
    for attempt in 1 2 3 4 5; do
      code=$(curl -sS -m 25 "https://api.botforge.org/v1/guides?id=$id" -o "$out.tmp" -w "%{http_code}")
      [ "$code" = "200" ] && mv "$out.tmp" "$out" && break
      sleep 20
    done
    sleep 12.5
  done
fi

echo "== 3. source harvest =="
# restore from the offline archive if present (faster + no network); else shallow-clone
ARCHIVE="$ROOT/archives/harvest-clones.tar.zst"
if [ -f "$ARCHIVE" ] && [ ! -d "/tmp/opencode/ForgeScript" ]; then
  echo "restoring harvest clones from $ARCHIVE"
  zstd -dc "$ARCHIVE" | tar -xf - -C /tmp/opencode
fi
# shallow-clone any still-missing repos (harvest reads /tmp/opencode/<Pkg>)
while read -r repo dir; do
  if [ -d "/tmp/opencode/.git" ] || [ -d "/tmp/opencode/$dir/.git" ]; then
    git -C "/tmp/opencode/$dir" fetch --depth 1 origin "HEAD:refresh" 2>/dev/null \
      && git -C "/tmp/opencode/$dir" reset --hard refresh >/dev/null 2>&1 \
      && git -C "/tmp/opencode/$dir" clean -fdq 2>/dev/null \
      && echo "updated $dir" || echo "WARN: could not update $repo"
  else
    git clone --depth 1 -q "https://github.com/$repo" "/tmp/opencode/$dir" || echo "WARN: could not clone $repo"
  fi
done <<'REPOS'
TryForge/ForgeScript ForgeScript
tryforge/ForgeDB ForgeDB
xNickyDev/ForgeRegex ForgeRegex
tryforge/ForgeCanvas ForgeCanvas
tryforge/ForgeMusic ForgeMusic
tryforge/ForgeTopGG ForgeTopGG
tryforge/ForgeLinked ForgeLinked
tryforge/ForgeGiveaways ForgeGiveaways
tryforge/ForgeMinecraft ForgeMinecraft
user-lezi/ForgeIndia ForgeIndia
user-lezi/ForgeColor ForgeColor
quoriel/db QuorielDB
REPOS
python3 "$ROOT/knowledge/_tools/harvest_sources.py" || true
python3 "$ROOT/knowledge/_tools/harvest_handlers.py" || true

echo "== 4. generate =="
python3 "$ROOT/knowledge/_tools/generate.py"

echo "== 5. tool recreations =="
for r in intents permissions scopes events; do
  [ -s "$CACHE/discord/$r.json" ] || curl -sS -m 20 "https://api.botforge.org/v1/discord?resource=$r" -o "$CACHE/discord/$r.json" && sleep 12.5
done
python3 "$ROOT/knowledge/_tools/build_tools.py" || true

echo "done."
