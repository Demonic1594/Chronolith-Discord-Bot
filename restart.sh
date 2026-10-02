#!/bin/sh
# Chronolith restart — the ONLY sanctioned way. Never kill a single PID:
# zombies share the token and double-handle every interaction.
# Usage: sh restart.sh   (from the repo root)
pkill -f "node index.js" 2>/dev/null
i=0
while pgrep -f "node index.js" >/dev/null 2>&1 && [ $i -lt 20 ]; do
    sleep 0.5
    i=$((i + 1))
done
if pgrep -f "node index.js" >/dev/null 2>&1; then
    echo "[restart] processes survived pkill — aborting rather than double-start." >&2
    exit 1
fi
rm -f bot.lock
nohup setsid node index.js </dev/null >>run.log 2>&1 &
sleep 8
PID=$(pgrep -f "node index.js" | head -1)
COUNT=$(pgrep -f "node index.js" | wc -l)
if [ "$COUNT" -eq 1 ] && [ -n "$PID" ]; then
    echo "[restart] Chronolith up as PID $PID (single instance)."
else
    echo "[restart] UNEXPECTED: $COUNT process(es) running — investigate." >&2
    pgrep -af "node index.js" >&2
    exit 1
fi
