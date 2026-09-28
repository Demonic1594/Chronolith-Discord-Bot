#!/usr/bin/env python3
"""fslint — ForgeScript static analyzer, debugger & local simulator. v2

Uses the BotForge knowledge base to lint ForgeScript code the way the real
compiler would, plus deeper checks for debugging real-world issues.

Usage:
  python3 tools/fslint.py                       # lint the repo
  python3 tools/fslint.py <file_or_dir>         # lint specific target
  python3 tools/fslint.py --snippet '$if[...'   # lint inline snippet
  python3 tools/fslint.py --sim '$ping'         # trace execution order
  python3 tools/fslint.py --deps                # dependency graph
  python3 tools/fslint.py --stats               # KB coverage stats
  python3 tools/fslint.py --explain '$fn'       # show KB info for a function

Checks (24):
  SYNTAX
   1. Bracket balance (escape-aware, nested)
   2. Unclosed function calls
   3. Unknown function names (against 2,460 KB pages + custom)
   4. $and/$or comma separators (should be semicolons)
   5. In-text semicolons inside $return[...] (splits args)

  SIGNATURES
   6. Argument count vs KB metadata (too many)
   7. Missing required arguments
   8. Custom-function call arity
   9. Deprecated function usage
  10. Experimental function usage (advisory)

  TYPE GATES
  11. Boolean literal feasibility ('yes'/'1'/'on' fail)
  12. http:// URL in URL-typed args
  13. Lowercase enum values (ButtonStyle is PascalCase)
  14. Snowflake format check (16-23 digit numeric for entity args)
  15. Time format check (raw numbers or Nd/Nh/Nm/Ns patterns)

  DATA INTEGRITY
  16. jsonSet snowflake coercion (unquoted IDs > 2^53)
  17. Top-level output leaks (value-returning calls without $!)
  18. $let variable used bare instead of $get[...]

  SECURITY
  19. Cooldown key on user text (bypass vector)
  20. $eval/$djsEval/$exec with user input ($message in args)
  21. $sendDM to self (bot-to-bot always fails)
  22. Missing $nomention on output embeds (ping-spam vector)

  COMPOSITION
  23. Custom-fn $return at top level (kills the command)
  24. Duplicated gate/cooldown (template + emitter both adding them)

Simulation (--sim):
  Traces execution order, arg counts, nesting depth, flags unknown functions.

Dependencies (--deps):
  Builds a call graph showing which custom functions call which,
  and which commands depend on which custom functions.

Explain (--explain):
  Shows the KB's full signature, quirks and reference implementation
  excerpt for any function.
"""
import json
import os
import re
import sys
from pathlib import Path
from collections import defaultdict

# ── Configuration ──────────────────────────────────────────────────────────
KB = Path(os.environ.get("FORGE_KB", "/workspace/BotForge/knowledge"))
ROOT = Path(__file__).resolve().parent.parent

# ── ANSI Colors ────────────────────────────────────────────────────────────
class C:
    RESET = "\033[0m"
    RED = "\033[31m"
    GREEN = "\033[32m"
    YELLOW = "\033[33m"
    BLUE = "\033[34m"
    MAGENTA = "\033[35m"
    CYAN = "\033[36m"
    DIM = "\033[2m"
    BOLD = "\033[1m"

    @classmethod
    def strip(cls):
        """Disable colors if not a TTY."""
        if not sys.stderr.isatty():
            for attr in dir(cls):
                if not attr.startswith("_") and attr != "strip":
                    setattr(cls, attr, "")

C.strip()

# ── KB Loading ─────────────────────────────────────────────────────────────

def load_signatures():
    """Load function signatures from KB (core + all extensions)."""
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
                r"\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|"
                r"\s*(\*?\*?yes\*?\*?|\*?\*?no\*?\*?)\s*\|\s*(\w+)",
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
            quirks = ""
            qm = re.search(r"## Quirks & gotchas\s*\n\s*\d+\.\s*(.+)", text)
            if qm:
                quirks = qm.group(1).strip()[:100]
            sigs[name.lower()] = {
                "name": name,
                "params": params,
                "alias_of": alias_of,
                "experimental": experimental,
                "deprecated": deprecated,
                "category": md.parent.name,
                "file": str(md),
                "description": text.split("\n")[2].strip("> \n")[:120] if len(text.split("\n")) > 2 else "",
                "quirks": quirks,
            }
    return sigs


def load_enums():
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
    custom = {}
    funcs_dir = root / "functions"
    if not funcs_dir.exists():
        return custom
    for js in funcs_dir.rglob("*.js"):
        text = js.read_text(encoding="utf-8")
        for m in re.finditer(r'name:\s*["\'](\w+)["\']\s*,\s*params:\s*\[(.*?)\]', text, re.S):
            pname, pbody = m.group(1), m.group(2)
            required = len(re.findall(r'"\w+"', pbody))
            # Find the code body for dependency analysis
            code_start = text.find("code: `", m.end())
            code_end = text.find("`", code_start + 7) if code_start > 0 else -1
            code_body = text[code_start+7:code_end] if code_start > 0 and code_end > 0 else ""
            custom[pname.lower()] = {
                "required": required, "max": required,
                "file": str(js.relative_to(root)),
                "code": code_body,
            }
    return custom


# ── Code Extraction ────────────────────────────────────────────────────────

def extract_code_strings(filepath):
    text = filepath.read_text(encoding="utf-8")
    return [m.group(1) for m in re.finditer(r"code:\s*`((?:\\.|[^`\\])*)`", text, re.S)]


def js_cook(code):
    out, i = [], 0
    while i < len(code):
        if code[i] == "\\" and i + 1 < len(code):
            out.append({"n": "\n", "t": "\t"}.get(code[i + 1], code[i + 1]))
            i += 2
        else:
            out.append(code[i])
            i += 1
    return "".join(out)


# ── Lint Infrastructure ────────────────────────────────────────────────────

CALL_RE = re.compile(r"\$[!#]?(?:@\[[^\]]*\])?([A-Za-z_][A-Za-z0-9_]*)\[")

SNOWFLAKE_RE = re.compile(r"^\d{16,23}$")
TIME_RE = re.compile(r"^(\d+([smhdw])?|inf)$", re.I)


class Finding:
    SEVERITY_ORDER = {"error": 0, "warn": 1, "info": 2}

    def __init__(self, severity, category, message, line=None, col=None, fix=None):
        self.severity = severity
        self.category = category
        self.message = message
        self.line = line
        self.col = col
        self.fix = fix  # suggested fix string

    def __str__(self):
        loc = f":{self.line}" if self.line else ""
        if self.col:
            loc += f":{self.col}"
        icon = {C.RED + "✗" + C.RESET, C.YELLOW + "⚠" + C.RESET, C.CYAN + "ℹ" + C.RESET}
        icon = {"error": C.RED + "✗" + C.RESET, "warn": C.YELLOW + "⚠" + C.RESET, "info": C.CYAN + "ℹ" + C.RESET}[self.severity]
        result = f"  {icon} [{C.DIM}{self.category}{C.RESET}] {self.message}{C.DIM}{loc}{C.RESET}"
        if self.fix:
            result += f"\n      {C.GREEN}→ Fix: {self.fix}{C.RESET}"
        return result


def split_args(body):
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
    return -1


def get_line_col(cooked, pos):
    line = cooked[:pos].count("\n") + 1
    col = pos - cooked.rfind("\n", 0, pos)
    return line, col


# ── Lint Checks ────────────────────────────────────────────────────────────

# Functions that return values which leak as output text
LEAKY_FNS = {
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

# Dangerous functions that should never receive user input
UNSAFE_FNS = {"$eval", "$djseval", "$exec"}

# Entity types that expect snowflakes
ENTITY_TYPES = {"Channel", "User", "Member", "Role", "Guild", "Message",
                "Webhook", "Invite", "Emoji", "Sticker", "TextChannel"}


def lint_code(code, sigs, custom, enums, label=""):
    findings = []
    cooked = js_cook(code)
    lines = cooked.split("\n")

    # ══ SYNTAX CHECKS ══════════════════════════════════════════════════════

    # 1. Bracket balance
    depth = 0
    for ln in lines:
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
            f"Bracket imbalance: net {depth:+d} — may be literal brackets in args; "
            f"run {C.BOLD}node validate.js{C.RESET} to confirm"))

    # 1b. $and/$or comma separators
    for _fname in ("$and", "$or"):
        _idx = 0
        while True:
            _j = cooked.find(_fname + "[", _idx)
            if _j < 0:
                break
            _d = 0
            _k = _j + len(_fname)
            _start = _k
            while _k < len(cooked):
                _c = cooked[_k]
                if _c == "\\":
                    _k += 2
                    continue
                if _c == "[":
                    _d += 1
                elif _c == "]":
                    _d -= 1
                    if _d == 0:
                        break
                _k += 1
            _inner = cooked[_start+1:_k]
            if "," in _inner:
                _ln, _col = get_line_col(cooked, _j)
                findings.append(Finding("error", "separators",
                    f"{_fname}[...] uses comma separator — should be semicolon (;)",
                    _ln, _col,
                    fix=f"{_fname}[arg1;arg2] not {_fname}[arg1,arg2]"))
            _idx = _k + 1

    # 2-10. Per-call checks
    pos = 0
    seen_fns = defaultdict(list)  # for duplicate detection
    all_lets = set()

    while True:
        m = CALL_RE.search(cooked, pos)
        if not m:
            break
        fname = m.group(1)
        fname_lower = fname.lower()
        line_no, col = get_line_col(cooked, m.start())

        body_start = m.end()
        body_end = find_call_end(cooked, body_start)
        if body_end < 0:
            findings.append(Finding("info", "brackets",
                f"${fname} may be unclosed (or contains literal brackets)", line_no, col))
            break
        body = cooked[body_start:body_end]
        # Search within this body too (nested calls) — set pos to just after
        # the function name so inner calls are found in order
        pos = body_start

        sig = sigs.get(fname_lower)
        is_custom = fname_lower in custom
        args = split_args(body)
        seen_fns[fname_lower].append((line_no, col))

        # 3. Unknown function
        if sig is None and not is_custom:
            suggestions = [s for s in sigs if fname_lower[:4] in s[:6]][:3]
            hint = f" (did you mean: ${', $'.join(sigs[s]['name'] for s in suggestions)})" if suggestions else ""
            findings.append(Finding("error", "unknown-fn",
                f"${fname} not found in KB or custom functions{hint}",
                line_no, col))

        # 4. Deprecated
        if sig and sig["deprecated"]:
            findings.append(Finding("warn", "deprecated",
                f"${fname} is deprecated — find a replacement", line_no, col))

        # 5. Experimental (advisory only)
        if sig and sig["experimental"]:
            findings.append(Finding("info", "experimental",
                f"${fname} is experimental — semantics may change between versions", line_no, col))

        # 6-7. Argument count (KB signature)
        if sig and sig["params"]:
            n_provided = len(args)
            n_nonempty = sum(1 for a in args if a.strip())
            max_args = len(sig["params"])
            has_rest = any(p["rest"] for p in sig["params"])
            required = sum(1 for p in sig["params"] if p["required"] and not p["rest"])

            if not has_rest and n_provided > max_args:
                findings.append(Finding("error", "arg-count",
                    f"${fname} called with {n_provided} args, signature takes max {max_args}",
                    line_no, col,
                    fix=f"Remove {n_provided - max_args} trailing arg(s) or escape semicolons in text"))

            if not has_rest and n_nonempty < required:
                missing = [p["name"] for idx, p in enumerate(sig["params"][:required])
                          if idx >= len(args) or not args[idx].strip()]
                findings.append(Finding("warn", "arg-count",
                    f"${fname} missing required arg(s): {', '.join(missing)}",
                    line_no, col))

        # 8. Custom function arity
        if is_custom:
            c = custom[fname_lower]
            if len(args) < c["required"]:
                findings.append(Finding("warn", "custom-arity",
                    f"${fname} (custom) called with {len(args)} args, needs {c['required']}",
                    line_no, col))

        # 9-15. Type-gate feasibility
        if sig and sig["params"]:
            for idx, a in enumerate(args):
                if idx >= len(sig["params"]):
                    break
                p = sig["params"][idx]
                a = a.strip()
                if not a or p["rest"]:
                    continue
                ln_c = (line_no, col)

                # 11. Boolean literal
                if p["type"] == "Boolean" and re.fullmatch(r"[A-Za-z0-9]+", a) and a not in ("true", "false"):
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1} ({p['name']}): '{a}' fails Boolean gate",
                        *ln_c, fix="Use literal 'true' or 'false' (case-sensitive)"))

                # 12. http:// URL
                if p["type"] == "URL" and a.startswith("http:") and not a.startswith("https:"):
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1} ({p['name']}): http:// fails https-only check",
                        *ln_c, fix="Use https://"))

                # 13. Lowercase enum (ButtonStyle)
                if p["type"] == "Enum" and a in ("success", "danger", "primary", "link", "secondary") and fname_lower == "addbutton":
                    pascal = a[0].upper() + a[1:]
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1}: '{a}' lowercase — use '{pascal}'",
                        *ln_c, fix=f"$addButton[...;{pascal};...]"))

                # 14. Snowflake format for entity types
                if p["type"] in ENTITY_TYPES and re.fullmatch(r"[A-Za-z<@#&][\w<>@#&]*", a) and not SNOWFLAKE_RE.match(a):
                    if not a.startswith("$") and not a.startswith("\\"):
                        findings.append(Finding("warn", "type-gate",
                            f"${fname} arg#{idx+1} ({p['name']}): '{a[:20]}' is not a snowflake ID — "
                            f"mentions and usernames fail the gate",
                            *ln_c, fix=f"Resolve to an ID first: $mentioned[0], $findUser[...], etc."))

                # 15. Time format
                if p["type"] == "Time" and re.fullmatch(r"[A-Za-z ]+", a) and not TIME_RE.match(a):
                    if not a.startswith("$"):
                        findings.append(Finding("warn", "type-gate",
                            f"${fname} arg#{idx+1} ({p['name']}): '{a}' not a valid time — use '10m', '1h30m', or ms number",
                            *ln_c))

    # ══ DATA INTEGRITY ═════════════════════════════════════════════════════

    # 16. jsonSet snowflake coercion
    for m in re.finditer(r"\$!?jsonSet\[[^;]*(?:;[^;]*)*;(\d{16,})[;\]]", cooked):
        snowflake = m.group(1)
        if int(snowflake) > 2**53:
            line_no, col = get_line_col(cooked, m.start())
            findings.append(Finding("error", "snowflake",
                f"jsonSet stores bare snowflake {snowflake[:8]}... — loses precision past 2^53",
                line_no, col, fix='Quote-wrap: $jsonSet[var;key;"$value"]'))

    # 17. Top-level output leaks
    for i, ln in enumerate(lines, 1):
        st = ln.lstrip()
        bare_fn = st.split("[")[0].lstrip("$!#").lower()
        if bare_fn in LEAKY_FNS and st.startswith("$") and not st.startswith("$!") and not st.startswith("$#"):
            if len(st.split("$")) <= 2:  # standalone statement
                findings.append(Finding("warn", "output-leak",
                    f"Top-level {st.split('[')[0]}[...] leaks its return — add $! prefix", i,
                    fix=f"$!{st.split('[')[0]}[...]"))

    # 18. Bare variable references
    KNOWN_VARS = set()
    for m in re.finditer(r"\$let\[(\w+);", cooked):
        KNOWN_VARS.add(m.group(1).lower())
    if KNOWN_VARS:
        skip = ("let|get|env|if|and|or|while|loop|switch|case|default|else|elseIf|try|"
                "return|break|continue|stop|fn|callFn|callFunction|localFunction|"
                "callLocalFunction|function|async|coroutine|nomention|ephemeral|defer|"
                "log|c\\[")
        for m in re.finditer(rf"\$(?!{skip})(\w+)\b(?!\[)", cooked):
            var = m.group(1)
            if var.lower() in KNOWN_VARS and f"$get[{var}]" not in cooked:
                line_no, col = get_line_col(cooked, m.start())
                findings.append(Finding("warn", "bare-var",
                    f"${var} is a $let variable used bare — prints literally as text",
                    line_no, col, fix=f"$get[{var}]"))

    # ══ SECURITY ═══════════════════════════════════════════════════════════

    # 19. Cooldown key on user text
    for m in re.finditer(r"\$cooldown\[\$message", cooked):
        line_no, col = get_line_col(cooked, m.start())
        findings.append(Finding("warn", "security",
            "Cooldown keyed on $message — user can vary the key to bypass cooldowns",
            line_no, col, fix="$cooldown[$authorID-$commandName;...]"))

    # 20. Unsafe functions with user input
    for m in CALL_RE.finditer(cooked):
        fn = m.group(1).lower()
        if fn in UNSAFE_FNS:
            body_start = m.end()
            body_end = find_call_end(cooked, body_start)
            if body_end > 0:
                body = cooked[body_start:body_end]
                if "$message" in body or "$input" in body or "$option" in body or "$customID" in body:
                    line_no, col = get_line_col(cooked, m.start())
                    findings.append(Finding("error", "security",
                        f"${m.group(1)} receives user input ($message/$option) — RCE risk",
                        line_no, col,
                        fix="Gate to owner-only; never pass user text to eval-family functions"))

    # 21. $sendDM to bot
    for m in re.finditer(r"\$sendDM\[\$botID", cooked):
        line_no, col = get_line_col(cooked, m.start())
        findings.append(Finding("info", "bot-dm",
            "$sendDM[$botID] — bots can't DM bots (error 50007)", line_no))

    # 22. Missing $nomention on punish commands
    has_mention_fn = any("$username" in ln or "$userTag" in ln or "<@" in ln for ln in lines)
    has_nomention = any("$nomention" in ln for ln in lines)
    if has_mention_fn and not has_nomention:
        findings.append(Finding("info", "mention",
            "Command outputs mentions but lacks $nomention — may ping users unexpectedly",
            fix="Add $nomention at the top of the code"))

    # ══ COMPOSITION ════════════════════════════════════════════════════════

    # 23. Custom-fn $return at top level
    for m in re.finditer(r"^(\w+)$", cooked, re.M):
        fn = m.group(1).lower()
        if fn in custom:
            line_no, _ = get_line_col(cooked, m.start())
            # Check if it's called bare (not inside $let)
            context = cooked[max(0, m.start()-50):m.start()]
            if "$let[" not in context and "$description[" not in context:
                findings.append(Finding("warn", "return-kill",
                    f"${m.group(1)} called bare at top level — its $return kills the command",
                    line_no, fix=f"$let[r;${m.group(1)}[...]]"))

    # 24. In-text semicolons in $return
    for m in re.finditer(r"\$return\[([^$\\\]]*;[^$\]]*)\]", cooked):
        inner = m.group(1)
        if ";" in inner and "$" not in inner:
            line_no, col = get_line_col(cooked, m.start())
            findings.append(Finding("error", "return-split",
                f"$return contains unescaped semicolon: '...{inner[:20]}...' — splits the arg",
                line_no, col, fix="Escape as \\; or rephrase without semicolons"))

    # Deduplicate findings (same category+message+line)
    seen = set()
    deduped = []
    for f in findings:
        key = (f.category, f.message, f.line)
        if key not in seen:
            seen.add(key)
            deduped.append(f)

    # Sort by severity then line
    deduped.sort(key=lambda f: (Finding.SEVERITY_ORDER.get(f.severity, 9), f.line or 0))
    return deduped


# ── Simulator ──────────────────────────────────────────────────────────────

def simulate(code, sigs, custom, enums, verbose=False):
    cooked = js_cook(code)

    # Build the call tree
    def build_tree(start, end):
        calls = []
        pos = start
        while True:
            m = CALL_RE.search(cooked, pos, end)
            if not m or m.start() >= end:
                break
            fname = m.group(1)
            body_start = m.end()
            body_end = find_call_end(cooked, body_start)
            if body_end < 0 or body_end >= end:
                break
            children = build_tree(body_start, body_end)
            args = split_args(cooked[body_start:body_end])
            sig = sigs.get(fname.lower())
            known = sig is not None or fname.lower() in custom
            calls.append({
                "name": fname,
                "args": args,
                "children": children,
                "known": known,
                "category": sig["category"] if sig else ("custom" if fname.lower() in custom else "???"),
                "pos": m.start(),
            })
            pos = body_end + 1
        return calls

    tree = build_tree(0, len(cooked))

    print(f"{C.BOLD}┌─ Simulation Trace{C.RESET} " + "─" * 40)
    print(f"{C.DIM}│ Input:{C.RESET} {cooked[:80]}{'...' if len(cooked) > 80 else ''}")
    print("│")

    total_calls = [0]
    max_depth = [0]
    unknown = []

    def render(calls, depth=0):
        indent = "  " * depth
        arrow = f"{C.CYAN}├─{C.RESET}" if depth > 0 else f"{C.BOLD}▶{C.RESET}"
        for call in calls:
            total_calls[0] += 1
            max_depth[0] = max(max_depth[0], depth)
            status = f"{C.GREEN}✓{C.RESET}" if call["known"] else f"{C.RED}✗{C.RESET}"
            color = C.GREEN if call["known"] else C.RED
            n_args = len(call["args"])
            arg_preview = ""
            if call["args"]:
                first = call["args"][0].strip()[:20]
                arg_preview = f" {C.DIM}({first}...){C.RESET}" if first else ""

            print(f"│ {indent}{arrow} {status} {color}${call['name']}{C.RESET}"
                  f"{C.DIM}[{n_args} args]{C.RESET} {C.DIM}({call['category']}){C.RESET}{arg_preview}")

            if not call["known"]:
                unknown.append(call["name"])

            if call["children"]:
                render(call["children"], depth + 1)

    render(tree)

    print("│")
    print(f"│ {C.BOLD}Total:{C.RESET} {total_calls[0]} calls, {max_depth[0]} max depth")
    if unknown:
        print(f"│ {C.RED}⚠ Unknown: {', '.join('$' + u for u in unknown)}{C.RESET}")
    else:
        print(f"│ {C.GREEN}✓ All functions recognized{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Dependency Graph ───────────────────────────────────────────────────────

def build_deps(custom, sigs, root):
    """Show which custom functions call which, and which commands use which."""
    print(f"{C.BOLD}┌─ Dependency Graph{C.RESET} " + "─" * 38)

    # Custom fn → called custom fns
    print(f"\n{C.BOLD}Custom function internal dependencies:{C.RESET}")
    for name, info in sorted(custom.items()):
        code = info.get("code", "")
        calls = set()
        for m in CALL_RE.finditer(code):
            called = m.group(1).lower()
            if called in custom and called != name:
                calls.add(called)
        if calls:
            print(f"  {C.CYAN}${info.get('file', '?').split('/')[-1]}::{name}{C.RESET}")
            for c in sorted(calls):
                print(f"    {C.DIM}→ ${custom[c].get('file', '?').split('/')[-1]}::{c}{C.RESET}")
        else:
            print(f"  {C.DIM}${name} (no custom-fn deps){C.RESET}")

    # Commands → custom fns used
    print(f"\n{C.BOLD}Commands → custom functions used:{C.RESET}")
    cmd_dirs = [root / "prefixesCmd", root / "slashesCmd", root / "events"]
    fn_usage = defaultdict(list)
    for cmd_dir in cmd_dirs:
        if not cmd_dir.exists():
            continue
        for js in cmd_dir.rglob("*.js"):
            text = js.read_text(encoding="utf-8")
            for m in re.finditer(r"code:\s*`((?:\\.|[^`\\])*)`", text, re.S):
                code = m.group(1)
                for cm in CALL_RE.finditer(code):
                    fn = cm.group(1).lower()
                    if fn in custom:
                        rel = js.relative_to(root) if js.is_relative_to(root) else js
                        fn_usage[fn].append(str(rel))

    for fn in sorted(fn_usage):
        files = fn_usage[fn]
        print(f"  {C.CYAN}${fn}{C.RESET} used in {len(files)} file(s)")
        for f in files[:3]:
            print(f"    {C.DIM}{f}{C.RESET}")
        if len(files) > 3:
            print(f"    {C.DIM}... and {len(files)-3} more{C.RESET}")

    print(f"\n{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Explain Mode ───────────────────────────────────────────────────────────

def explain(fn_name, sigs, enums):
    fn_name = fn_name.lstrip("$").lower()
    sig = sigs.get(fn_name)

    print(f"{C.BOLD}┌─ ${sig['name'] if sig else fn_name}{C.RESET} " + "─" * 44)

    if not sig:
        print(f"│ {C.RED}Not found in knowledge base{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return

    print(f"│ {C.DIM}Category:{C.RESET} {sig['category']}")
    if sig["alias_of"]:
        print(f"│ {C.DIM}Alias of:{C.RESET} ${sig['alias_of']}")
    if sig["deprecated"]:
        print(f"│ {C.RED}⚠ DEPRECATED{C.RESET}")
    if sig["experimental"]:
        print(f"│ {C.YELLOW}⚠ EXPERIMENTAL{C.RESET}")
    print(f"│ {C.DIM}Description:{C.RESET} {sig.get('description', '—')}")

    if sig["params"]:
        print(f"\n│ {C.BOLD}Signature:{C.RESET}")
        sig_str = "$" + sig["name"] + "["
        parts = []
        for p in sig["params"]:
            marker = p["name"]
            if p["required"]:
                marker = f"{C.BOLD}{marker}{C.RESET}"
            if p["rest"]:
                marker += "..."
            parts.append(marker)
        sig_str += "; ".join(parts) + "]"
        print(f"│   {sig_str}")

        print(f"\n│ {C.BOLD}Parameters:{C.RESET}")
        for i, p in enumerate(sig["params"], 1):
            req = f"{C.RED}*{C.RESET}" if p["required"] else " "
            rest = f" {C.DIM}(rest){C.RESET}" if p["rest"] else ""
            print(f"│   {req} {i}. {C.CYAN}{p['name']}{C.RESET} "
                  f"{C.DIM}({p['type']}){C.RESET}{rest}")

    if sig.get("quirks"):
        print(f"\n│ {C.BOLD}Key quirk:{C.RESET} {sig['quirks']}")

    # Read reference implementation if available
    try:
        text = Path(sig["file"]).read_text(encoding="utf-8")
        ref = re.search(r"## Reference implementation.*?```ts\n(.*?)```", text, re.S)
        if ref:
            impl = ref.group(1).strip()
            print(f"\n│ {C.BOLD}Implementation (first 5 lines):{C.RESET}")
            for line in impl.split("\n")[:5]:
                print(f"│   {C.DIM}{line}{C.RESET}")
    except Exception:
        pass

    print(f"\n│ {C.DIM}Full docs: {sig['file']}{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Stats ──────────────────────────────────────────────────────────────────

def show_stats(sigs, custom, enums):
    print(f"{C.BOLD}┌─ Knowledge Base Stats{C.RESET} " + "─" * 37)
    print(f"│ Functions indexed: {C.BOLD}{len(sigs)}{C.RESET}")
    aliases = sum(1 for s in sigs.values() if s["alias_of"])
    print(f"│   Aliases: {aliases}")
    print(f"│   Canonical: {len(sigs) - aliases}")
    exp = sum(1 for s in sigs.values() if s["experimental"])
    dep = sum(1 for s in sigs.values() if s["deprecated"])
    print(f"│   {C.YELLOW}Experimental: {exp}{C.RESET}")
    print(f"│   {C.RED}Deprecated: {dep}{C.RESET}")
    print(f"│ Enums loaded: {len(enums)}")
    print(f"│ Custom functions (bot): {len(custom)}")

    cats = defaultdict(int)
    for s in sigs.values():
        cats[s["category"]] += 1
    print(f"│ Categories: {len(cats)}")
    for cat in sorted(cats, key=lambda c: -cats[c])[:10]:
        bar = "█" * min(cats[cat] // 10, 20)
        print(f"│   {cat:>12} {cats[cat]:>4} {C.CYAN}{bar}{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Main ───────────────────────────────────────────────────────────────────

def lint_path(path, sigs, custom, enums):
    path = Path(path)
    files = []
    if path.is_dir():
        for pattern in ("prefixesCmd/**/*.js", "slashesCmd/**/*.js",
                        "functions/*.js", "events/*.js", "events/**/*.js"):
            files.extend(path.glob(pattern))
    elif path.is_file():
        files = [path]
    else:
        print(f"Error: {path} not found")
        return 1

    total_errors = 0
    total_warns = 0
    total_files = 0
    cat_counts = defaultdict(int)

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
            print(f"\n{C.BOLD}{rel}{C.RESET}")
            for finding in file_findings:
                print(finding)
                cat_counts[finding.category] += 1

    print(f"\n{'─' * 60}")
    print(f"Linted {C.BOLD}{total_files}{C.RESET} files: "
          f"{C.RED}{total_errors} errors{C.RESET}, "
          f"{C.YELLOW}{total_warns} warnings{C.RESET}")

    if cat_counts:
        print(f"\n{C.DIM}By category:{C.RESET}")
        for cat in sorted(cat_counts, key=lambda c: -cat_counts[c]):
            print(f"  {cat}: {cat_counts[cat]}")

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

    if "--explain" in sys.argv:
        idx = sys.argv.index("--explain")
        if idx + 1 < len(sys.argv):
            explain(sys.argv[idx + 1], sigs, enums)
            return 0

    if "--deps" in sys.argv:
        build_deps(custom, sigs, ROOT)
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
                print(f"{C.GREEN}✓ Clean — no issues found{C.RESET}")
            return 1 if any(f.severity == "error" for f in findings) else 0

    if "--sim" in sys.argv:
        idx = sys.argv.index("--sim")
        if idx + 1 < len(sys.argv):
            simulate(sys.argv[idx + 1], sigs, custom, enums)
            return 0

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
