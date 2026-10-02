#!/usr/bin/env python3
r"""Chronolith local sanity checker — bracket balance + function-name existence.

Checks every command/event/function file's `code` strings for:
  1. bracket balance ([ vs ], ignoring escaped \[ \]) — per code string
  2. every $name[ token references a function that exists in the local KB
     (chronolith custom functions + ForgeScript core + ForgeDB)

Not a compiler — the real validation is `node validate.js` (loads everything
through the actual ForgeScript compiler). This catches authoring mistakes fast.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# --- collect known function names -------------------------------------------
known = set()
KB = "/workspace/BotForge/knowledge/functions"
if os.path.isdir(KB):
    for dp, _, fns in os.walk(KB):
        for f in fns:
            if f.endswith(".md"):
                known.add(f[1:-3].lower())
FORGEDB = "/workspace/BotForge/knowledge/extensions/forgedb/functions"
if os.path.isdir(FORGEDB):
    for f in os.listdir(FORGEDB):
        if f.endswith(".md"):
            known.add(f[1:-3].lower())
# custom functions defined in this repo
for dp, _, fns in os.walk(os.path.join(ROOT, "functions")):
    for f in fns:
        if not f.endswith(".js"):
            continue
        text = open(os.path.join(dp, f), encoding="utf-8").read()
        for m in re.finditer(r'name:\s*["\'](\w+)["\']', text):
            known.add(m.group(1).lower())

errors = 0
files = 0

def js_cook(code):
    """Approximate JS template-literal cooking: \\X -> X (the engine never
    sees single backslashes the JS layer already ate)."""
    out, i = [], 0
    while i < len(code):
        c = code[i]
        if c == "\\" and i + 1 < len(code):
            nxt = code[i+1]
            out.append({"n": "\n", "t": "	"}.get(nxt, nxt))
            i += 2
        else:
            out.append(c)
            i += 1
    return "".join(out)


def check_code(label, code):
    global errors
    code = js_cook(code)
    # bracket balance, ignoring escapes
    # openers are call brackets ($fn[ ... ), including $@[sep]fn[ prefixes;
    # a bare [ in text is literal; only unescaped ] closes.
    opener = re.compile(r"\$[!#]?(?:@\[[^\]]*\])?[A-Za-z_][A-Za-z0-9_]*\[")
    depth = 0
    mind = 0
    i = 0
    n = len(code)
    while i < n:
        c = code[i]
        if c == "\\":
            i += 2
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            mind = min(mind, depth)
        i += 1
    if depth != 0 or mind < 0:
        print(f"BRACKET  {label}: balance={depth} min={mind}")
        errors += 1
    # unknown function names ($name followed by [ or bare at word boundary)
    for m in re.finditer(r"\$[!#]?(?:@\[[^\]]*\])?([A-Za-z_][A-Za-z0-9_]*)", code):
        name = m.group(1).lower()
        if name and name not in known:
            # skip JS-ish words that snuck in (shouldn't happen inside code strings)
            print(f"UNKNOWN  {label}: ${name}")
            errors += 1

def walk(folder):
    global files
    for dp, _, fns in os.walk(folder):
        for f in sorted(fns):
            if not f.endswith(".js"):
                continue
            files += 1
            path = os.path.join(dp, f)
            src = open(path, encoding="utf-8").read()
            for m in re.finditer(r"code:\s*`((?:\\.|[^`\\])*)`", src, re.S):
                check_code(f"{path}", m.group(1))

for folder in ("events", "prefixesCmd", "slashesCmd", "functions"):
    p = os.path.join(ROOT, folder)
    if os.path.isdir(p):
        walk(p)

print(f"\nChecked {files} files — {errors} problem(s).")
sys.exit(1 if errors else 0)
