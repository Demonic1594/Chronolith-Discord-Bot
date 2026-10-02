#!/usr/bin/env python3
"""Harvest per-function source info (execute body, flags, file path) from cloned package repos."""
import json, os, re, sys

REPOS = {
    "ForgeScript": "/tmp/opencode/ForgeScript",
    "ForgeDB": "/tmp/opencode/ForgeDB",
    "ForgeRegex": "/tmp/opencode/ForgeRegex",
    "ForgeCanvas": "/tmp/opencode/ForgeCanvas",
    "ForgeMusic": "/tmp/opencode/ForgeMusic",
    "ForgeTopGG": "/tmp/opencode/ForgeTopGG",
    "ForgeLinked": "/tmp/opencode/ForgeLinked",
    "ForgeGiveaways": "/tmp/opencode/ForgeGiveaways",
    "ForgeMinecraft": "/tmp/opencode/ForgeMinecraft",
    "ForgeIndia": "/tmp/opencode/ForgeIndia",
    "ForgeColor": "/tmp/opencode/ForgeColor",
    "QuorielDB": "/tmp/opencode/QuorielDB",
    "Edge": "/tmp/opencode/edge",
}

NAME_RE = re.compile(r'name:\s*["\']?(\$[A-Za-z0-9_]+)')
EXPERIMENTAL_RE = re.compile(r'experimental:\s*true')
DEPRECATED_RE = re.compile(r'deprecated:\s*true')

def extract_block(src: str, start_idx: int) -> str:
    """Brace-match extraction starting at the '{' at/after start_idx."""
    i = src.index('{', start_idx)
    depth, instr = 0, False
    j = i
    while j < len(src):
        c = src[j]
        if instr:
            if c == '\\':
                j += 2
                continue
            if c in ('"', "'", '`'):
                instr = False
        elif c in ('"', "'", '`'):
            instr = True
        elif c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return src[i:j+1]
        j += 1
    return src[i:]

def extract_execute(block: str) -> str:
    """Pull the execute(...) implementation out of a NativeFunction block."""
    m = re.search(r'\bexecute\s*\(', block)
    if not m:
        return None
    # find opening brace of execute body: after the closing paren of the signature
    i = m.end()
    depth = 1
    while i < len(block) and depth:
        if block[i] == '(':
            depth += 1
        elif block[i] == ')':
            depth -= 1
        i += 1
    body = extract_block(block, i)
    # dedent/trim
    lines = body.splitlines()
    if lines:
        lines[0] = 'execute(...) {'
        lines[-1] = '}'
    return '\n'.join(lines)

NATIVE_RE = re.compile(r'new\s+(?:NativeFunction|ForgeFunction)\s*\(')

def harvest(repo_dir: str):
    out = {}
    for root, _, files in os.walk(os.path.join(repo_dir, 'src')):
        for fn in files:
            if not (fn.endswith('.ts') or fn.endswith('.js')):
                continue
            path = os.path.join(root, fn)
            try:
                src = open(path, encoding='utf-8').read()
            except Exception:
                continue
            for nm in NATIVE_RE.finditer(src):
                try:
                    block = extract_block(src, nm.end())
                except ValueError:
                    continue
                m = NAME_RE.search(block)
                if not m:
                    continue
                name = m.group(1)
                exec_body = extract_execute(block)
                out[name] = {
                    'file': os.path.relpath(path, repo_dir),
                    'experimental': bool(EXPERIMENTAL_RE.search(block)),
                    'deprecated': bool(DEPRECATED_RE.search(block)),
                    'execute': exec_body,
                }
    return out

def main():
    result = {}
    for pkg, d in REPOS.items():
        if not os.path.isdir(d):
            print(f'{pkg}: repo missing, skipped', file=sys.stderr)
            continue
        harvested = harvest(d)
        result[pkg] = harvested
        print(f'{pkg}: {len(harvested)} functions harvested')
    dest = '/workspace/BotForge/.knowledge-cache/source_map.json'
    json.dump(result, open(dest, 'w'), indent=1)
    print(f'-> {dest} ({sum(len(v) for v in result.values())} total)')

if __name__ == '__main__':
    main()
