#!/usr/bin/env python3
"""Build machine-verified drill banks into wisdom/study/banks/.
Writes ONLY into banks/ — the rest of wisdom/ is hand-written territory."""
import json, random, os

CACHE = '/workspace/BotForge/.knowledge-cache'
OUT = '/workspace/BotForge/wisdom/study/banks'
random.seed(20260926)  # deterministic banks per data snapshot

meta = json.load(open(f'{CACHE}/meta/ForgeScript__functionsUrl.json'))
harv = json.load(open(f'{CACHE}/source_map.json'))['ForgeScript']
alias_map = {}
for f in meta:
    for a in (f.get('aliases') or []):
        alias_map[a] = f['name']

os.makedirs(OUT, exist_ok=True)

# ---- Bank 1: signature drills (how many args / which required)
drills = []
for f in random.sample(meta, 220):
    args = f.get('args') or []
    if not args:
        continue
    rest = any(a.get('rest') for a in args)
    req = [a['name'] for a in args if a.get('required')]
    drills.append((f['name'], f.get('category'), args, rest, req))

lines = ['# Bank 1 — signature drills (auto-generated, answers verified against metadata)', '',
         'Rapid recall: for each function, answer (a) total args, (b) the required ones, (c) has a rest arg? Answer key at the bottom.', '']
for i, (name, cat, args, rest, req) in enumerate(drills, 1):
    lines.append(f'{i}. `{name}` ({cat})')
lines += ['', '---', '', '## Answer key', '']
for i, (name, cat, args, rest, req) in enumerate(drills, 1):
    arglist = ', '.join(f"{a['name']}{'*' if a.get('required') else ''}{'+rest' if a.get('rest') else ''}" for a in args)
    lines.append(f'{i}. `{name}` — {len(args)} args: {arglist or "—"}' + (' — REST' if rest else ''))
open(f'{OUT}/bank-signatures.md', 'w').write('\n'.join(lines) + '\n')

# ---- Bank 2: alias drills
pairs = random.sample(sorted(alias_map.items()), min(120, len(alias_map)))
lines = ['# Bank 2 — alias drills (auto-generated)', '',
         'Give the canonical name for each alias. Key at bottom.', '']
for i, (alias, canon) in enumerate(pairs, 1):
    lines.append(f'{i}. `{alias}`')
lines += ['', '---', '', '## Answer key', '']
for i, (alias, canon) in enumerate(pairs, 1):
    lines.append(f'{i}. `{alias}` → `{canon}`')
open(f'{OUT}/bank-aliases.md', 'w').write('\n'.join(lines) + '\n')

# ---- Bank 3: flag & version drills
flagged = [(n, s['experimental'], s['deprecated']) for n, s in harv.items() if s['experimental'] or s['deprecated']]
lines = ['# Bank 3 — flags & experimental map (auto-generated)', '',
         'Which of these are experimental, which deprecated? Key at bottom.', '']
names = [n for n, _, _ in flagged]
random.shuffle(names)
for i, n in enumerate(names, 1):
    lines.append(f'{i}. `{n}`')
lines += ['', '---', '', '## Answer key', '']
for i, n in enumerate(names, 1):
    e = any(n == x[0] and x[1] for x in flagged)
    d = any(n == x[0] and x[2] for x in flagged)
    lines.append(f"{i}. `{n}` — {'experimental' if e else ''}{'deprecated' if d else ''}".rstrip(' —'))
open(f'{OUT}/bank-flags.md', 'w').write('\n'.join(lines) + '\n')

print('banks written:', os.listdir(OUT))
