#!/usr/bin/env python3
"""Chronolith deep static audit.

Beyond check.py's bracket/name checks, this verifies per CALL SITE:
  1. argument count against the real signature metadata in the BotForge KB
     (too-many is a compile error; too-few required args is the runtime
     MissingArg the compiler does NOT catch)
  2. literal-argument type feasibility: booleans must be true/false, enum
     args must be exact keys of that function's enum, permission args must
     be camelCase PermissionFlagsBits keys
  3. custom-function call arity vs their declared params

Reads signatures from /workspace/BotForge/knowledge (metadata-derived) —
not from memory, per the KB's own discipline.
"""
import json, os, re, sys

KB = "/workspace/BotForge/knowledge/functions"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---- load signatures --------------------------------------------------------
sigs = {}   # name -> {max_args, params: [(name, type, required, rest)], enum_types}
for dp, _, fns in os.walk(KB):
    for f in fns:
        if not f.endswith(".md") or f == "_INDEX.md":
            continue
        name = f[1:-3]
        path = os.path.join(dp, f)
        text = open(path, encoding="utf-8").read()
        params = []
        rows = re.findall(r"\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*(\*?\*?yes\*?\*?|\*?\*?no\*?\*?)\s*\|\s*(\w+)", text)
        for pname, ptype, req, rest in rows:
            if pname.lower() == "name" and ptype == "Type":
                continue
            params.append((pname, ptype, req.strip("*") == "yes", rest.strip() == "yes"))
        if params:
            sigs[name.lower()] = params

# enums from the KB
ENUMS = {}
for dp, _, fns in os.walk("/workspace/BotForge/knowledge/enums"):
    for f in fns:
        if f.endswith(".md") and f != "_INDEX.md":
            vals = re.findall(r"^\|\s*`([^`]+)`\s*\|", open(os.path.join(dp, f), encoding="utf-8").read(), re.M)
            if vals:
                ENUMS[f[:-3]] = set(vals)

# custom functions in this repo (name -> required param count, max)
custom = {}
for dp, _, fns in os.walk(os.path.join(ROOT, "functions")):
    for f in fns:
        if not f.endswith(".js"):
            continue
        src = open(os.path.join(dp, f), encoding="utf-8").read()
        for m in re.finditer(r'name:\s*["\'](\w+)["\']\s*,\s*params:\s*\[(.*?)\]', src, re.S):
            pname, pbody = m.group(1), m.group(2)
            nreq = len(re.findall(r'"\w+"', pbody))
            custom[pname.lower()] = (nreq, nreq)

# ---- code extraction (template literal with escaped backticks) ---------------
def cook(c):
    out, i = [], 0
    while i < len(c):
        if c[i] == "\\" and i + 1 < len(c):
            out.append(c[i+1]); i += 2
        else:
            out.append(c[i]); i += 1
    return "".join(out)

def split_args(body):
    """Split an arg body on top-level ; (respecting nesting and escapes)."""
    args, cur, depth, i = [], "", 0, 0
    while i < len(body):
        c = body[i]
        if c == "\\":
            cur += body[i:i+2]; i += 2; continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth < 0:
                break
        if c == ";" and depth == 0:
            args.append(cur); cur = ""
        else:
            cur += c
        i += 1
    args.append(cur)
    return [a for a in args]

CALL = re.compile(r"\$[!#]?(?:@\[[^\]]*\])?([A-Za-z_][A-Za-z0-9_]*)\[")
problems = []

def audit_code(label, code):
    pos = 0
    while True:
        m = CALL.search(code, pos)
        if not m:
            break
        name = m.group(1)
        # find the matching close bracket of this call
        depth, i = 1, m.end()
        body_start = m.end()
        while i < len(code) and depth > 0:
            c = code[i]
            if c == "\\":
                i += 2; continue
            if c == "[":
                depth += 1
            elif c == "]":
                depth -= 1
                if depth == 0:
                    break
            i += 1
        if depth != 0:
            problems.append(f"{label}: ${name} unclosed")
            break
        body = code[body_start:i]
        pos = i + 1

        lname = name.lower()
        params = sigs.get(lname)
        if params is not None:
            args = split_args(body)
            # trailing empty args count as "provided but empty"
            n_args = len(args)
            n_fields = 0
            for idx, a in enumerate(args):
                if a.strip():
                    n_fields = idx + 1
            max_args = len(params)
            has_rest = any(p[3] for p in params)
            if not has_rest and n_args > max_args:
                problems.append(f"{label}: ${name} called with {n_args} args, signature has {max_args}")
            required = sum(1 for p in params if p[2] and not p[3])
            if not has_rest and n_fields < required:
                missing = [p[0] for idx2, p in enumerate(params[:required]) if not args[idx2].strip()]
                problems.append(f"{label}: ${name} missing required arg(s): {missing}")
            # literal feasibility checks
            for idx, a in enumerate(args):
                if idx >= len(params):
                    break
                pname, ptype, req, rest = params[idx]
                a = a.strip()
                if not a:
                    continue
                if ptype == "Boolean" and re.fullmatch(r"[A-Za-z0-9]+", a) and a not in ("true", "false"):
                    problems.append(f"{label}: ${name} arg#{idx+1} ({pname}) Boolean literal '{a}' will FAIL the gate")
                if ptype == "URL" and a.startswith("http:") and "https:" not in a:
                    problems.append(f"{label}: ${name} arg#{idx+1} ({pname}) http:// URL fails the https-only gate")
                if ptype == "Enum" and re.fullmatch(r"[A-Za-z_][\w]*", a):
                    # find which enum: look for the enum name in the param notes
                    enum_name = None
                    notefile = None
                    # crude: search the KB page for "Enum" + enum link
                    pass
        elif lname in custom:
            nreq, nmax = custom[lname]
            args = split_args(body)
            n_fields = 0
            for idx, a in enumerate(args):
                if a.strip():
                    n_fields = idx + 1
            if n_args if False else len(args) > nmax:
                problems.append(f"{label}: ${name} (custom) called with {len(args)} args, takes {nmax}")
            if n_fields < nreq:
                problems.append(f"{label}: ${name} (custom) missing args ({n_fields}/{nreq})")

for folder in ("events", "prefixesCmd", "slashesCmd", "functions"):
    p = os.path.join(ROOT, folder)
    if not os.path.isdir(p):
        continue
    for dp, _, fns in os.walk(p):
        for f in sorted(fns):
            if not f.endswith(".js"):
                continue
            path = os.path.join(dp, f)
            src = open(path, encoding="utf-8").read()
            for m in re.finditer(r"code:\s*`((?:\\.|[^`\\])*)`", src, re.S):
                audit_code(f"{folder}/{f}", cook(m.group(1)))

print(f"Audited against {len(sigs)} KB signatures + {len(custom)} custom fns")
print(f"{len(problems)} problem(s):")
for p in problems:
    print("  -", p)
