#!/usr/bin/env python3
"""fslint — ForgeScript static analyzer & local simulator.

Uses the BotForge knowledge base (/workspace/BotForge/knowledge) to lint
ForgeScript code the way the real compiler would, plus extra checks the
compiler can't do. Works on individual snippets or entire bot codebases.

Usage:
  python3 tools/fslint.py <file_or_dir>       # lint files (default: this repo)
  python3 tools/fslint.py --snippet '$if[...'  # lint a single snippet
  python3 tools/fslint.py --sim '$ping'        # simulate (trace execution)
  python3 tools/fslint.py --stats              # KB coverage stats

Checks performed:
  1. Bracket balance (escape-aware, nested)
  2. Unknown function names (against all KB function pages + aliases)
  3. Argument count vs KB signature metadata (too many / too few required)
  4. Literal type-gate feasibility (booleans, URLs, enums)
  5. Top-level output leaks (value-returning calls without $! prefix)
  6. $and/$or comma separators (should be semicolons)
  7. Bare variable references ($var instead of $get[var])
  8. jsonSet snowflake coercion (unquoted IDs > 2^53)
  9. Custom-function call arity vs declared params
  10. Cooldown key sanity (user-controlled text in keys = bypass vector)
"""
import json
import os
import re
import sys
from pathlib import Path

# ── Configuration ──────────────────────────────────────────────────────────
KB = Path(os.environ.get("FORGE_KB", "/workspace/BotForge/knowledge"))
ROOT = Path(__file__).resolve().parent.parent

# ── KB Loading ─────────────────────────────────────────────────────────────

def load_signatures():
    """Load function signatures from KB markdown pages (core + all extensions)."""
    sigs = {}
    fn_dirs = [KB / "functions"]
    ext_dir = KB / "extensions"
    if ext_dir.exists():
        for pkg in ext_dir.iterdir():
            pkg_fn = pkg / "functions"
            if pkg_fn.is_dir():
                fn_dirs.append(pkg_fn)

    for fn_dir in fn_dirs:
        if not fn_dir.exists():
            continue
        for md in fn_dir.rglob("*.md"):
            if md.name == "_INDEX.md":
                continue
            name = md.stem.lstrip("$")
            text = md.read_text(encoding="utf-8")
            params = []
            rows = re.findall(
                r"\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*(\*?\*?yes\*?\*?|\*?\*?no\*?\*?)\s*\|\s*(\w+)",
                text,
            )
            for pname, ptype, req, rest in rows:
                if pname.lower() == "name" and ptype.lower() == "type":
                    continue
                params.append({
                    "name": pname,
                    "type": ptype,
                    "required": req.strip("*") == "yes",
                    "rest": rest.strip() == "yes",
                })
            alias_match = re.search(r"Alias of [`$]?(\w+)", text)
            alias_of = alias_match.group(1) if alias_match else None
            experimental = "experimental" in text.lower()[:500]
            deprecated = "deprecated" in text.lower()[:500]
            sigs[name.lower()] = {
                "name": name,
                "params": params,
                "alias_of": alias_of,
                "experimental": experimental,
                "deprecated": deprecated,
                "category": md.parent.name,
            }
    return sigs


def load_enums():
    """Load enum values from KB."""
    enums = {}
    enum_dir = KB / "enums"
    if not enum_dir.exists():
        return enums
    for md in enum_dir.rglob("*.md"):
        if md.name == "_INDEX.md":
            continue
        vals = re.findall(r"^\|\s*`([^`]+)`\s*\|", md.read_text(encoding="utf-8"), re.M)
        if vals:
            enums[md.stem] = set(vals)
    return enums


def load_custom_functions(root):
    """Load custom function declarations from a bot codebase."""
    custom = {}
    funcs_dir = root / "functions"
    if not funcs_dir.exists():
        return custom
    for js in funcs_dir.rglob("*.js"):
        text = js.read_text(encoding="utf-8")
        for m in re.finditer(r'name:\s*["\'](\w+)["\']\s*,\s*params:\s*\[(.*?)\]', text, re.S):
            pname, pbody = m.group(1), m.group(2)
            required = len(re.findall(r'"\w+"', pbody))
            custom[pname.lower()] = {"required": required, "max": required, "file": str(js)}
    return custom


# ── Code Extraction ────────────────────────────────────────────────────────

def extract_code_strings(filepath):
    """Extract code: `...` template literals from JS files."""
    text = filepath.read_text(encoding="utf-8")
    results = []
    for m in re.finditer(r"code:\s*`((?:\\.|[^`\\])*)`", text, re.S):
        results.append(m.group(1))
    return results


def js_cook(code):
    """Approximate JS template literal cooking (\\X → X)."""
    out, i = [], 0
    while i < len(code):
        if code[i] == "\\" and i + 1 < len(code):
            out.append({"n": "\n", "t": "\t"}.get(code[i + 1], code[i + 1]))
            i += 2
        else:
            out.append(code[i])
            i += 1
    return "".join(out)


# ── Lint Checks ────────────────────────────────────────────────────────────

CALL_RE = re.compile(r"\$[!#]?(?:@\[[^\]]*\])?([A-Za-z_][A-Za-z0-9_]*)\[")


class Finding:
    def __init__(self, severity, category, message, line=None, col=None):
        self.severity = severity  # "error", "warn", "info"
        self.category = category
        self.message = message
        self.line = line
        self.col = col

    def __str__(self):
        loc = f":{self.line}" if self.line else ""
        if self.col:
            loc += f":{self.col}"
        icon = {"error": "✗", "warn": "⚠", "info": "ℹ"}[self.severity]
        return f"  {icon} [{self.category}] {self.message}{loc}"


def split_args(body):
    """Split an arg body on top-level semicolons (respecting nesting and escapes)."""
    args, cur, depth = [], "", 0
    i = 0
    while i < len(body):
        c = body[i]
        if c == "\\":
            cur += body[i:i+2]
            i += 2
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth < 0:
                break
        if c == ";" and depth == 0:
            args.append(cur)
            cur = ""
        else:
            cur += c
        i += 1
    args.append(cur)
    return args


def find_call_end(code, start):
    """Find the matching ] for a function call that opens at `start`."""
    depth, i = 1, start
    while i < len(code):
        c = code[i]
        if c == "\\":
            i += 2
            continue
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1  # unclosed


def lint_code(code, sigs, custom, enums, label=""):
    """Run all lint checks on a single code string."""
    findings = []
    cooked = js_cook(code)
    lines = cooked.split("\n")

    # ── 1. Bracket balance ──
    # Note: literal brackets in args (e.g. $checkContains[text;[;count]) cause false positives.
    # The real compiler is the authority — use validate.js for definitive checking.
    depth = 0
    for i, ln in enumerate(lines, 1):
        j = 0
        while j < len(ln):
            if ln[j] == "\\":
                j += 2
                continue
            if ln[j] == "[":
                depth += 1
            elif ln[j] == "]":
                depth -= 1
            j += 1
    if depth != 0:
        findings.append(Finding("warn", "brackets",
            f"Bracket imbalance: net {depth:+d} — may be literal brackets in args; run node validate.js to confirm"))

    # ── 2-4. Per-call checks ──
    pos = 0
    while True:
        m = CALL_RE.search(cooked, pos)
        if not m:
            break
        fname = m.group(1)
        fname_lower = fname.lower()
        line_no = cooked[:m.start()].count("\n") + 1
        col = m.start() - cooked.rfind("\n", 0, m.start())

        # Find call body
        body_start = m.end()
        body_end = find_call_end(cooked, body_start)
        if body_end < 0:
            findings.append(Finding("info", "brackets",
                f"${fname} may be unclosed (or contains literal brackets in args — check with compiler)", line_no, col))
            break
        body = cooked[body_start:body_end]
        pos = body_end + 1

        # ── 2. Unknown function ──
        sig = sigs.get(fname_lower)
        is_custom = fname_lower in custom
        if sig is None and not is_custom:
            # Check if it's an alias stub pointing to something known
            findings.append(Finding("error", "unknown-fn",
                f"${fname} not found in KB or custom functions"))

        # ── 3. Argument count ──
        if sig and sig["params"]:
            args = split_args(body)
            n_provided = len(args)
            n_nonempty = sum(1 for a in args if a.strip())
            max_args = len(sig["params"])
            has_rest = any(p["rest"] for p in sig["params"])
            required = sum(1 for p in sig["params"] if p["required"] and not p["rest"])

            if not has_rest and n_provided > max_args:
                findings.append(Finding("warn", "arg-count",
                    f"${fname} called with {n_provided} args, signature has max {max_args}"))

            if not has_rest and n_nonempty < required:
                missing = [p["name"] for idx, p in enumerate(sig["params"][:required])
                          if not args[idx].strip()] if len(args) >= required else ["<insufficient args>"]
                findings.append(Finding("warn", "arg-count",
                    f"${fname} missing required arg(s): {missing}"))

        # ── 3b. Custom function arity ──
        if is_custom:
            args = split_args(body)
            c = custom[fname_lower]
            if len(args) < c["required"]:
                findings.append(Finding("warn", "custom-arity",
                    f"${fname} (custom) called with {len(args)} args, needs {c['required']}"))

        # ── 4. Literal type-gate feasibility ──
        if sig and sig["params"]:
            args = split_args(body)
            for idx, a in enumerate(args):
                if idx >= len(sig["params"]):
                    break
                p = sig["params"][idx]
                a = a.strip()
                if not a or p["rest"]:
                    continue
                if p["type"] == "Boolean" and re.fullmatch(r"[A-Za-z0-9]+", a) and a not in ("true", "false"):
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1} ({p['name']}): '{a}' will FAIL Boolean gate"))
                if p["type"] == "URL" and a.startswith("http:") and not a.startswith("https:"):
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1} ({p['name']}): http:// URL fails https-only gate"))
                if p["type"] == "Enum" and a in ("success", "danger", "primary", "link") and fname_lower == "addbutton":
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1}: '{a}' lowercase — ButtonStyle keys are PascalCase"))

    # ── 5. Top-level output leaks ──
    LEAKY = {
        "$setguildvar", "$arraypush", "$arraysplice", "$arrayload", "$arraymap",
        "$arrayfilter", "$arrayforeach", "$arrayslice", "$setchannelslowmode",
        "$ban", "$unban", "$kick", "$timeout", "$memberaddroles",
        "$memberremoveroles", "$membersetnickname", "$createchannel",
        "$deletemessage", "$clearmessages", "$clearusermessages",
        "$addchannelperms", "$removechannelperms", "$deletechannelperms",
        "$deleteallmessagereactions", "$senddm", "$jsondelete", "$newcase",
        "$modlogpost", "$dmnotify", "$lockchan", "$unlockchan", "$lockall",
        "$unlockall", "$tempbansweep", "$locksweep", "$scanmessages",
    }
    for i, ln in enumerate(lines, 1):
        st = ln.lstrip()
        bare_fn = st.split("[")[0].lstrip("$!#")
        if bare_fn.lower() in LEAKY and st.startswith("$") and not st.startswith("$!") and not st.startswith("$#"):
            # Skip if embedded in another call's argument on same line
            before = st[:1]  # just the $
            if len(st.split("$")) <= 2:  # likely standalone
                findings.append(Finding("warn", "output-leak",
                    f"Top-level {st.split('[')[0]}[...] may leak its return value — add $! prefix", i))

    # ── 6. $and/$or comma separators ──
    for fname in ("$and", "$or"):
        idx = 0
        while True:
            j = cooked.find(fname + "[", idx)
            if j < 0:
                break
            d = 0
            k = j + len(fname)
            start = k
            while k < len(cooked):
                c = cooked[k]
                if c == "\\":
                    k += 2
                    continue
                if c == "[":
                    d += 1
                elif c == "]":
                    d -= 1
                    if d == 0:
                        break
                k += 1
            inner = cooked[start+1:k]
            if "," in inner:
                line_no = cooked[:j].count("\n") + 1
                findings.append(Finding("error", "separators",
                    f"{fname}[...] uses comma separator — should be semicolon (;)", line_no))
            idx = k + 1

    # ── 7. Bare variable references ──
    KNOWN_VARS = set()  # populated by $let declarations in this code
    for m in re.finditer(r"\$let\[(\w+);", cooked):
        KNOWN_VARS.add(m.group(1))
    for m in re.finditer(r"\$(?!let|get|env|if|and|or|while|loop|switch|case|default|else|elseIf|try|return|break|continue|stop|fn|callFn|callFunction|localFunction|callLocalFunction|function|async|coroutine|nomention|ephemeral|defer|log|c\[)(\w+)\b(?!\[)", cooked):
        var = m.group(1)
        if var.lower() in KNOWN_VARS and f"${var}" in cooked and f"$get[{var}]" not in cooked:
            line_no = cooked[:m.start()].count("\n") + 1
            findings.append(Finding("warn", "bare-var",
                f"${var} used as bare reference — did you mean $get[{var}]?", line_no))

    # ── 8. jsonSet snowflake coercion ──
    for m in re.finditer(r"\$!?\$?jsonSet\[[^;]*;(\d{15,})[;\]]", cooked):
        snowflake = m.group(1)
        if int(snowflake) > 2**53:
            line_no = cooked[:m.start()].count("\n") + 1
            findings.append(Finding("error", "snowflake",
                f"jsonSet stores bare snowflake {snowflake[:6]}... — will lose precision past 2^53. "
                f"Wrap in quotes: \"$...\"", line_no))

    # ── 10. Cooldown key on user text ──
    for m in re.finditer(r"\$cooldown\[\$message", cooked):
        line_no = cooked[:m.start()].count("\n") + 1
        findings.append(Finding("warn", "security",
            "Cooldown key uses $message — user-controlled text = bypass vector", line_no))

    return findings


# ── Simulator ──────────────────────────────────────────────────────────────

def simulate(code, sigs, custom, enums):
    """Trace execution of a ForgeScript snippet — show the resolution order."""
    cooked = js_cook(code)
    print("┌─ Simulation Trace " + "─" * 40)
    print(f"│ Input: {cooked[:80]}{'...' if len(cooked) > 80 else ''}")
    print("│")

    # Find all function calls in order
    calls = []
    pos = 0
    while True:
        m = CALL_RE.search(cooked, pos)
        if not m:
            break
        fname = m.group(1)
        body_start = m.end()
        body_end = find_call_end(cooked, body_start)
        if body_end < 0:
            break
        calls.append((fname, cooked[body_start:body_end], m.start()))
        pos = body_end + 1

    depth = 0
    for fname, body, start in calls:
        line = cooked.rfind("\n", 0, start) + 1
        indent = "  " * depth
        sig = sigs.get(fname.lower())
        known = sig is not None or fname.lower() in custom

        status = "✓" if known else "✗"
        cat = sig["category"] if sig else ("custom" if fname.lower() in custom else "UNKNOWN")
        n_args = len(split_args(body))

        print(f"│ {indent}{status} ${fname}[{n_args} args] ({cat})")

        # Check for nested calls (increment depth)
        nested = CALL_RE.search(body)
        if nested:
            depth += 1
        elif depth > 0 and start > cooked.rfind("]", 0, start):
            depth = max(0, depth - 1)

    print("│")
    print(f"│ Total: {len(calls)} function calls, {depth} max nesting")
    unknown = [c for c in calls if c[0].lower() not in sigs and c[0].lower() not in custom]
    if unknown:
        print(f"│ ⚠ Unknown functions: {', '.join('$' + c[0] for c in unknown)}")
    else:
        print(f"│ ✓ All functions recognized")
    print("└" + "─" * 50)


# ── Stats ──────────────────────────────────────────────────────────────────

def show_stats(sigs, custom, enums):
    print("┌─ Knowledge Base Stats " + "─" * 37)
    print(f"│ Functions indexed: {len(sigs)}")
    aliases = sum(1 for s in sigs.values() if s["alias_of"])
    print(f"│   Aliases: {aliases}")
    print(f"│   Canonical: {len(sigs) - aliases}")
    exp = sum(1 for s in sigs.values() if s["experimental"])
    dep = sum(1 for s in sigs.values() if s["deprecated"])
    print(f"│   Experimental: {exp}")
    print(f"│   Deprecated: {dep}")
    print(f"│ Enums loaded: {len(enums)}")
    print(f"│ Custom functions (bot): {len(custom)}")

    cats = {}
    for s in sigs.values():
        cats[s["category"]] = cats.get(s["category"], 0) + 1
    print(f"│ Categories: {len(cats)}")
    for cat in sorted(cats, key=lambda c: -cats[c])[:10]:
        print(f"│   {cat}: {cats[cat]}")
    print("└" + "─" * 50)


# ── Main ───────────────────────────────────────────────────────────────────

def lint_path(path, sigs, custom, enums):
    """Lint a file or directory."""
    path = Path(path)
    files = []
    if path.is_dir():
        for pattern in ("prefixesCmd/**/*.js", "slashesCmd/**/*.js", "functions/*.js", "events/*.js"):
            files.extend(path.glob(pattern))
    elif path.is_file():
        files = [path]
    else:
        print(f"Error: {path} not found")
        return 1

    total_errors = 0
    total_warns = 0
    total_files = 0

    for f in sorted(files):
        code_strings = extract_code_strings(f)
        if not code_strings:
            continue
        total_files += 1
        file_findings = []
        for code in code_strings:
            file_findings.extend(lint_code(code, sigs, custom, enums, str(f)))

        if file_findings:
            rel = f.relative_to(ROOT) if f.is_relative_to(ROOT) else f
            errors = sum(1 for x in file_findings if x.severity == "error")
            warns = sum(1 for x in file_findings if x.severity == "warn")
            total_errors += errors
            total_warns += warns
            print(f"\n{rel}")
            for finding in file_findings:
                print(finding)

    print(f"\n{'─' * 60}")
    print(f"Linted {total_files} files: {total_errors} errors, {total_warns} warnings")
    return 1 if total_errors else 0


def main():
    sigs = load_signatures()
    custom = load_custom_functions(ROOT)
    enums = load_enums()

    if not sigs:
        print("Error: No KB signatures loaded. Set FORGE_KB env var.")
        return 1

    if "--stats" in sys.argv:
        show_stats(sigs, custom, enums)
        return 0

    if "--snippet" in sys.argv:
        idx = sys.argv.index("--snippet")
        if idx + 1 < len(sys.argv):
            snippet = sys.argv[idx + 1]
            findings = lint_code(snippet, sigs, custom, enums)
            if findings:
                for f in findings:
                    print(f)
            else:
                print("✓ Clean — no issues found")
            return 1 if any(f.severity == "error" for f in findings) else 0

    if "--sim" in sys.argv:
        idx = sys.argv.index("--sim")
        if idx + 1 < len(sys.argv):
            snippet = sys.argv[idx + 1]
            simulate(snippet, sigs, custom, enums)
            return 0

    # Default: lint the repo
    target = ROOT
    for arg in sys.argv[1:]:
        if not arg.startswith("--"):
            p = Path(arg)
            if p.exists():
                target = p
            break

    return lint_path(target, sigs, custom, enums)


if __name__ == "__main__":
    sys.exit(main())
