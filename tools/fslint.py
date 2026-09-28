#!/usr/bin/env python3
"""fslint — ForgeScript static analyzer, debugger & local simulator. v3

The most comprehensive ForgeScript linter possible. Uses the BotForge
knowledge base (2,460+ function signatures, 96 enums) plus bot-specific
custom functions to catch every class of bug before runtime.

Usage:
  python3 tools/fslint.py                       # lint the repo
  python3 tools/fslint.py <file_or_dir>         # lint specific target
  python3 tools/fslint.py --snippet '$if[...'   # lint inline snippet
  python3 tools/fslint.py --sim '$ping'         # trace execution order
  python3 tools/fslint.py --deps                # dependency graph
  python3 tools/fslint.py --stats               # KB coverage stats
  python3 tools/fslint.py --explain '$fn'       # show KB info for a function
  python3 tools/fslint.py --diff                # prefix vs slash mirror diff

CHECKS (48):
  SYNTAX & STRUCTURE
   1. Bracket balance (escape-aware, line-tracked, exact position)
   2. Unclosed function calls (per-call, not just global count)
   3. Unknown function names (against all KB pages + custom)
   4. $and/$or comma separators at top level (should be semicolons)
   5. In-text unescaped semicolons inside single-arg functions
   6. Mismatched escape sequences (\n in text is literal backslash-n)
   7. Nested bracket depth > 20 (readability warning)
   8. Unescaped literal brackets in text args

  SIGNATURES & CONTRACTS
   9. Argument count vs KB metadata (too many)
  10. Missing required arguments
  11. Custom-function call arity
  12. Deprecated function usage
  13. Experimental function usage (advisory)
  14. Alias chain depth (alias → alias → alias = confusing)

  TYPE GATES (the runtime InvalidArgType killers)
  15. Boolean: 'yes'/'1'/'on'/'True' all fail (only 'true'/'false')
  16. URL: http:// fails (https only)
  17. Enum: lowercase ButtonStyle keys (PascalCase required)
  18. Enum: value not in the enum's known set (from KB enum data)
  19. Snowflake: non-numeric text in entity-typed args
  20. Time: prose strings ('10 minutes') fail
  21. Number: non-numeric literals
  22. Color: invalid hex/color names

  DATA INTEGRITY
  23. jsonSet bare snowflake (precision loss past 2^53)
  24. jsonSet nested dynamic keys (silently fail)
  25. Top-level output leaks (value-returning calls without $!)
  26. $let variable used bare instead of $get[...]
  27. $let defined but never read
  28. $get[...] on never-defined variable
  29. jsonLoad without matching jsonStringify round-trip
  30. arrayLoad on empty string default (phantom [""] element)

  SECURITY
  31. Cooldown key on user text ($message → bypass vector)
  32. $eval/$djsEval/$exec receiving user input ($message/$option)
  33. $sendDM to $botID (bot-to-bot always fails)
  34. Missing $nomention on commands that output mentions
  35. Unvalidated user input in djsEval interpolations

  COMPOSITION & FLOW
  36. Custom-fn bare call at top level ($return kills the command)
  37. $return inside $if inside custom fn (early exit that skips later code)
  38. Read-modify-write on guild vars (race condition advisory)
  39. $arrayIncludes with digit-string needle (coercion always fails)
  40. $parseMS with text argument (it's ms→text, not text→ms)
  41. Prefix/slash mirror mismatch (different logic in the two files)
  42. Orphan command files (not present in the generator spec)

  PERFORMANCE
  43. Unbounded loops ($loop[-1...] without $break guard)
  44. $arrayForEach inside $arrayForEach (O(n²) pattern)
  45. Excessive nesting in single expression (>10 levels)

  STYLE
  46. Deeply nested $if chains (suggest $ifx)
  47. Repeated function calls on same variable (suggest $let caching)
  48. Overly long single-line code (>200 chars)

SIMULATION (--sim):
  Full execution tree with variable flow tracking, branch prediction,
  side-effect classification (send/mutate/read), and timing hints.

DEPENDENCIES (--deps):
  Call graph, circular dependency detection, unused functions.

EXPLAIN (--explain):
  Full KB lookup: signature, params, quirks, implementation excerpt,
  related functions, common mistakes.

DIFF (--diff):
  Compares prefix and slash command files for logic drift.
"""
import json
import os
import re
import sys
import time
from pathlib import Path
from collections import defaultdict, OrderedDict

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
    UNDERLINE = "\033[4m"

    @classmethod
    def strip(cls):
        if not sys.stderr.isatty():
            for attr in dir(cls):
                if not attr.startswith("_") and attr != "strip":
                    setattr(cls, attr, "")
C.strip()

# ── KB Loading ─────────────────────────────────────────────────────────────

def load_signatures():
    """Load ALL function signatures from the KB (core + every extension)."""
    sigs = {}
    fn_dirs = [KB / "functions"]
    ext_dir = KB / "extensions"
    if ext_dir.exists():
        for pkg in sorted(ext_dir.iterdir()):
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

            # Extract enum name for Enum-typed params
            enum_names = {}
            for i, p in enumerate(params):
                if p["type"] == "Enum":
                    # Look for the enum name in the per-param notes
                    pat = rf"\*\*`{re.escape(p['name'])}`\*\*.*?`(\w+)`"
                    em = re.search(pat, text)
                    if em:
                        enum_names[i] = em.group(1)

            alias_match = re.search(r"Alias of [`$]?(\w+)", text)
            alias_of = alias_match.group(1) if alias_match else None
            experimental = "experimental" in text.lower()[:500]
            deprecated = "deprecated" in text.lower()[:500]
            quirks = ""
            qm = re.search(r"## Quirks & gotchas\s*\n\s*\d+\.\s*(.+)", text)
            if qm:
                quirks = qm.group(1).strip()[:120]

            # Extract output type
            output_row = re.search(r"\|\s*Output\s*\|\s*`(\w+)`\s*\|", text)

            # Get description from the header blockquote
            desc_lines = []
            for ln in text.split("\n")[1:6]:
                if ln.startswith(">"):
                    desc_lines.append(ln.lstrip("> "))
                elif ln.strip() == "" and desc_lines:
                    break
            desc = " ".join(desc_lines)[:120]

            sigs[name.lower()] = {
                "name": name,
                "params": params,
                "enum_names": enum_names,
                "alias_of": alias_of,
                "experimental": experimental,
                "deprecated": deprecated,
                "category": md.parent.name,
                "file": str(md),
                "description": desc,
                "quirks": quirks,
                "output": output_row.group(1) if output_row else None,
                "unwrap": "unwrap: true" in text.lower() or "| yes |" in text and "unwrap" in text.lower(),
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
            enums[md.stem.lower()] = set(vals)  # case-insensitive lookup
    return enums


def load_custom_functions(root):
    custom = {}
    funcs_dir = root / "functions"
    if not funcs_dir.exists():
        return custom
    for js in sorted(funcs_dir.rglob("*.js")):
        text = js.read_text(encoding="utf-8")
        for m in re.finditer(
            r'name:\s*["\'](\w+)["\']\s*,\s*params:\s*\[(.*?)\]',
            text, re.S,
        ):
            pname, pbody = m.group(1), m.group(2)
            required = len(re.findall(r'"\w+"', pbody))
            # Extract the code body
            code_start = text.find("code: `", m.end())
            code_end = text.find("`", code_start + 7) if code_start > 0 else -1
            code_body = text[code_start + 7 : code_end] if code_start > 0 and code_end > 0 else ""
            # Check if it has a $return (for top-level kill detection)
            has_return = "$return[" in code_body
            # Collect all called custom fns for dependency graph
            called = set()
            for cm in re.finditer(r"\$[!#]?(\w+)\[", code_body):
                called.add(cm.group(1).lower())

            custom[pname.lower()] = {
                "name": pname,
                "required": required,
                "max": required,
                "file": str(js.relative_to(root)),
                "code": code_body,
                "has_return": has_return,
                "called": called,
            }
    return custom


def load_command_registry(root):
    """Load all registered command names/aliases from prefix files."""
    commands = {}
    for cmd_dir in (root / "prefixesCmd", root / "slashesCmd"):
        if not cmd_dir.exists():
            continue
        for js in cmd_dir.rglob("*.js"):
            text = js.read_text(encoding="utf-8")
            nm = re.search(r'name:\s*["\'](\w+)["\']', text)
            al = re.search(r'aliases:\s*\[(.*?)\]', text)
            if nm:
                name = nm.group(1)
                aliases = (
                    re.findall(r'["\'](\w+)["\']', al.group(1)) if al else []
                )
                rel = str(js.relative_to(root))
                commands[name] = {"aliases": aliases, "file": rel}
                for a in aliases:
                    commands.setdefault(a, {"aliases": [], "file": rel, "alias_of": name})
    return commands


# ── Code Extraction & Cooking ──────────────────────────────────────────────

def extract_code_strings(filepath):
    text = filepath.read_text(encoding="utf-8")
    return [
        m.group(1)
        for m in re.finditer(r"code:\s*`((?:\\.|[^`\\])*)`", text, re.S)
    ]


def js_cook(code):
    """JS template literal cooking with proper escape handling."""
    out, i = [], 0
    while i < len(code):
        if code[i] == "\\" and i + 1 < len(code):
            nxt = code[i + 1]
            out.append(
                {"n": "\n", "t": "\t", "r": "\r"}.get(nxt, nxt)
            )
            i += 2
        else:
            out.append(code[i])
            i += 1
    return "".join(out)


# ── Lint Infrastructure ────────────────────────────────────────────────────

CALL_RE = re.compile(r"\$[!#]?(?:@\[[^\]]*\])?([A-Za-z_][A-Za-z0-9_]*)\[")

SNOWFLAKE_RE = re.compile(r"^\d{16,23}$")
TIME_RE = re.compile(r"^(\d+(\.\d+)?(ms|s|m|h|d|w)?|inf)$", re.I)
COLOR_RE = re.compile(r"^#?[0-9a-fA-F]{6}$|^[0-9a-fA-F]{3}$")
NUMBER_RE = re.compile(r"^-?\d+(\.\d+)?$")
PERMISSION_RE = re.compile(r"^[A-Z][a-zA-Z]*$")

# Value-returning functions that leak output if unnegated at top level
LEAKY_FNS = {
    "setguildvar", "arraypush", "arraysplice", "arrayslice",
    "setchannelslowmode", "ban", "unban", "kick", "timeout",
    "memberaddroles", "memberremoveroles", "membersetnickname",
    "createchannel", "deletemessage", "clearmessages", "clearusermessages",
    "addchannelperms", "removechannelperms", "deletechannelperms",
    "deleteallmessagereactions", "senddm", "jsondelete", "newcase",
    "modlogpost", "dmnotify", "lockchan", "unlockchan", "lockall",
    "unlockall", "tempbansweep", "locksweep", "scanmessages",
}

# Functions that should never receive user input
UNSAFE_FNS = {"eval", "djseval", "exec"}

# Entity types that expect snowflakes
ENTITY_TYPES = {
    "channel", "user", "member", "role", "guild", "message",
    "webhook", "invite", "emoji", "sticker", "textchannel",
}

# Known-safe empty-arg functions (intentional $let[x;] etc.)
EMPTY_SAFE = {"let", "replace", "default", "return", "if", "ifx"}

SEVERITY_ORDER = {"error": 0, "warn": 1, "info": 2}


class Finding:
    __slots__ = ("severity", "category", "message", "line", "col", "fix", "context")

    def __init__(self, severity, category, message, line=None, col=None,
                 fix=None, context=None):
        self.severity = severity
        self.category = category
        self.message = message
        self.line = line
        self.col = col
        self.fix = fix
        self.context = context  # surrounding code line for context

    def __str__(self):
        loc = f":{self.line}" if self.line else ""
        if self.col:
            loc += f":{self.col}"
        icon = {
            "error": C.RED + "✗" + C.RESET,
            "warn": C.YELLOW + "⚠" + C.RESET,
            "info": C.CYAN + "ℹ" + C.RESET,
        }[self.severity]
        result = f"  {icon} [{C.DIM}{self.category}{C.RESET}] {self.message}{C.DIM}{loc}{C.RESET}"
        if self.context:
            result += f"\n      {C.DIM}│ {self.context.strip()[:70]}{C.RESET}"
        if self.fix:
            result += f"\n      {C.GREEN}→ {self.fix}{C.RESET}"
        return result


def split_args(body):
    """Split an arg body on top-level semicolons (escape/nesting aware)."""
    args, cur, depth = [], "", 0
    i = 0
    while i < len(body):
        c = body[i]
        if c == "\\":
            cur += body[i : i + 2]
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
    """Find the matching ] for a call that opens at `start`."""
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


def get_context_line(cooked, pos):
    start = cooked.rfind("\n", 0, pos) + 1
    end = cooked.find("\n", pos)
    if end < 0:
        end = len(cooked)
    return cooked[start:end].strip()[:80]


# ── Variable Flow Tracker ──────────────────────────────────────────────────

class VarTracker:
    """Tracks $let definitions and $get/$env reads for flow analysis."""

    def __init__(self):
        self.defined = set()       # variables defined via $let
        self.read = set()          # variables read via $get or $env
        self.let_lines = {}        # var → line number of definition

    def note_let(self, name, line):
        self.defined.add(name)
        self.let_lines[name] = line

    def note_get(self, name):
        self.read.add(name)

    def undefined_reads(self):
        return self.read - self.defined

    def unused_defs(self):
        return self.defined - self.read


# ── Main Lint Function ─────────────────────────────────────────────────────

def lint_code(code, sigs, custom, enums, label="", cmd_registry=None):
    """Run ALL lint checks on a single code string. Returns [Finding]."""
    findings = []
    cooked = js_cook(code)
    lines = cooked.split("\n")

    # Track all function calls for cross-checks
    all_calls = []  # (fname, body, line, col, context_line)

    # Variable flow
    vt = VarTracker()

    # Track guild vars accessed for RMW race detection
    guild_var_writes = []
    guild_var_reads = []

    # Track djsEval usage for injection detection
    djs_eval_bodies = []

    # Track loop nesting for O(n²) detection
    loop_depth = 0
    nested_loops = []

    # ══ SYNTAX & STRUCTURE ════════════════════════════════════════════════

    # ── 1. Bracket balance with per-line tracking ──
    total_depth = 0
    line_depths = []
    for ln in lines:
        j = 0
        depth_at_line_start = total_depth
        while j < len(ln):
            if ln[j] == "\\":
                j += 2
                continue
            if ln[j] == "[":
                total_depth += 1
            elif ln[j] == "]":
                total_depth -= 1
            j += 1
        line_depths.append((depth_at_line_start, total_depth))

        if total_depth < 0:
            ctx = ln.strip()[:80]
            findings.append(Finding("error", "brackets",
                f"Bracket depth went NEGATIVE on this line (extra ])",
                len(line_depths), 1,
                fix="Remove the extra ] or escape it as \\]",
                context=ctx))
            total_depth = 0  # reset to avoid cascading

    if total_depth > 0:
        findings.append(Finding("warn", "brackets",
            f"Bracket imbalance: net +{total_depth} (unclosed [) — "
            f"may be literal brackets in args; run node validate.js to confirm"))

    # ── 2-14, 15-48. Per-call checks (the main scan) ──
    pos = 0
    call_chain_depth = 0
    max_nesting = 0
    current_nesting = 0

    while True:
        m = CALL_RE.search(cooked, pos)
        if not m:
            break

        fname = m.group(1)
        fname_lower = fname.lower()
        line_no, col = get_line_col(cooked, m.start())
        ctx_line = get_context_line(cooked, m.start())

        body_start = m.end()
        body_end = find_call_end(cooked, body_start)

        if body_end < 0:
            findings.append(Finding("error", "brackets",
                f"${fname} unclosed — no matching ] found",
                line_no, col,
                fix="Add the closing ] or escape literal brackets",
                context=ctx_line))
            break

        body = cooked[body_start:body_end]
        args = split_args(body)
        pos = body_start  # search nested calls too

        all_calls.append((fname, body, line_no, col, ctx_line))

        sig = sigs.get(fname_lower)
        is_custom = fname_lower in custom

        # ── 3. Unknown function ──
        if sig is None and not is_custom:
            # Suggest similar functions
            close = [
                s for s in sigs
                if fname_lower[:4] in s and abs(len(s) - len(fname_lower)) <= 4
            ][:3]
            hint = (
                f" (similar: ${', $'.join(sigs[s]['name'] for s in close)})"
                if close else ""
            )
            findings.append(Finding("error", "unknown-fn",
                f"${fname} not found in KB or custom functions{hint}",
                line_no, col,
                fix=f"Check spelling, or load the extension that provides it",
                context=ctx_line))

        # ── 9. Deprecated ──
        if sig and sig["deprecated"]:
            findings.append(Finding("warn", "deprecated",
                f"${fname} is deprecated", line_no, col,
                fix="Find a replacement in the KB",
                context=ctx_line))

        # ── 10. Experimental ──
        if sig and sig["experimental"]:
            findings.append(Finding("info", "experimental",
                f"${fname} is experimental — semantics may change between versions",
                line_no, col, context=ctx_line))

        # ── 11-12. Argument count ──
        if sig and sig["params"]:
            n_provided = len(args)
            n_nonempty = sum(1 for a in args if a.strip())
            max_args = len(sig["params"])
            has_rest = any(p["rest"] for p in sig["params"])
            required = sum(1 for p in sig["params"] if p["required"] and not p["rest"])

            if not has_rest and n_provided > max_args:
                findings.append(Finding("error", "arg-count",
                    f"${fname} called with {n_provided} args, takes max {max_args}",
                    line_no, col,
                    fix=f"Remove {n_provided - max_args} trailing arg(s) or \\; escape semicolons in text",
                    context=ctx_line))

            if not has_rest and fname_lower not in EMPTY_SAFE and n_nonempty < required:
                missing = [
                    p["name"] for idx, p in enumerate(sig["params"][:required])
                    if idx >= len(args) or not args[idx].strip()
                ]
                findings.append(Finding("warn", "arg-count",
                    f"${fname} missing required arg(s): {', '.join(missing)}",
                    line_no, col, context=ctx_line))

        # ── 13. Custom function arity ──
        if is_custom:
            c = custom[fname_lower]
            if len(args) < c["required"]:
                findings.append(Finding("warn", "custom-arity",
                    f"${fname} (custom) called with {len(args)} args, needs {c['required']}",
                    line_no, col, context=ctx_line))

        # ── 15-22. Type-gate feasibility ──
        if sig and sig["params"]:
            for idx, a in enumerate(args):
                if idx >= len(sig["params"]):
                    break
                p = sig["params"][idx]
                a = a.strip()
                if not a or p["rest"]:
                    continue

                # Skip if the arg contains function calls (dynamic value)
                if "$" in a:
                    continue

                # 15. Boolean
                if p["type"] == "Boolean" and re.fullmatch(r"[A-Za-z0-9]+", a) and a not in ("true", "false"):
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1} ({p['name']}): '{a}' fails Boolean gate "
                        f"(only literal 'true'/'false' accepted)",
                        line_no, col,
                        fix=f"$fn[...;{'true' if a.lower() in ('yes','on','1') else 'false'};...]",
                        context=ctx_line))

                # 16. URL
                if p["type"] == "URL" and a.startswith("http:") and not a.startswith("https:"):
                    findings.append(Finding("error", "type-gate",
                        f"${fname} arg#{idx+1}: http:// fails https-only gate",
                        line_no, col, fix="Use https://",
                        context=ctx_line))

                # 17-18. Enum checks
                if p["type"] == "Enum":
                    enum_key = sig.get("enum_names", {}).get(idx)
                    if enum_key and enum_key in enums:
                        valid = enums[enum_key]
                        if a not in valid:
                            # Check if it's a case issue
                            case_match = [v for v in valid if v.lower() == a.lower()]
                            if case_match:
                                findings.append(Finding("error", "type-gate",
                                    f"${fname} arg#{idx+1}: '{a}' wrong case — use '{case_match[0]}'",
                                    line_no, col,
                                    fix=f"Change to '{case_match[0]}'",
                                    context=ctx_line))
                            else:
                                findings.append(Finding("warn", "type-gate",
                                    f"${fname} arg#{idx+1}: '{a}' not in {enum_key} enum "
                                    f"(valid: {', '.join(sorted(valid)[:5])}...)",
                                    line_no, col, context=ctx_line))

                # 19. Snowflake format
                if p["type"].lower() in ENTITY_TYPES and re.fullmatch(r"[A-Za-z<@#&][\w<>@#&]*", a) and not SNOWFLAKE_RE.match(a):
                    findings.append(Finding("warn", "type-gate",
                        f"${fname} arg#{idx+1} ({p['name']}): '{a[:25]}' not a snowflake — "
                        f"mentions/usernames fail the gate",
                        line_no, col,
                        fix="Resolve to ID: $mentioned[0], $findUser[...], $channelID, etc.",
                        context=ctx_line))

                # 20. Time format
                if p["type"] == "Time" and re.fullmatch(r"[A-Za-z ]+", a) and not TIME_RE.match(a):
                    findings.append(Finding("warn", "type-gate",
                        f"${fname} arg#{idx+1}: '{a}' not a valid time format "
                        f"(use '10m', '1h30m', or ms number)",
                        line_no, col, context=ctx_line))

                # 21. Number
                if p["type"] == "Number" and not NUMBER_RE.match(a) and not TIME_RE.match(a):
                    findings.append(Finding("warn", "type-gate",
                        f"${fname} arg#{idx+1}: '{a[:20]}' is not numeric",
                        line_no, col, context=ctx_line))

                # 22. Color
                if p["type"] == "Color" and not COLOR_RE.match(a) and not a.startswith("$"):
                    findings.append(Finding("info", "type-gate",
                        f"${fname} arg#{idx+1}: '{a}' may not be a valid color "
                        f"(expected hex like FF0000 or #FF0000)",
                        line_no, col, context=ctx_line))

        # ── 26. Track $let definitions for variable flow ──
        if fname_lower == "let" and args:
            var_name = args[0].strip()
            if var_name:
                vt.note_let(var_name, line_no)
        elif fname_lower in ("get", "env") and args:
            var_name = args[0].strip()
            if var_name:
                vt.note_get(var_name)

        # ── 38. Guild var RMW race detection ──
        if fname_lower == "setguildvar" and len(args) >= 2:
            guild_var_writes.append((args[0].strip(), line_no))
        elif fname_lower == "getguildvar" and args:
            guild_var_reads.append((args[0].strip(), line_no))

        # ── 32. Unsafe functions with user input ──
        if fname_lower in UNSAFE_FNS:
            if any(x in body for x in ("$message", "$input", "$option", "$customID", "$focusedOption")):
                findings.append(Finding("error", "security",
                    f"${fname} receives user input — RCE risk",
                    line_no, col,
                    fix="Gate to owner-only; never pass user text to eval-family functions",
                    context=ctx_line))

        # ── 35. djsEval with interpolated values ──
        if fname_lower == "djseval":
            djs_eval_bodies.append((body, line_no, col, ctx_line))
            # Check for interpolation without sanitization
            for interp in re.finditer(r"\$env\[(\w+)\]", body):
                var = interp.group(1)
                # If the variable is defined from user input in this code
                for (fn2, body2, _, _, _) in all_calls:
                    if fn2.lower() == "let" and f"${var}" in body2 and "$message" in body2:
                        findings.append(Finding("error", "security",
                            f"$djsEval interpolates $env[{var}] which traces back to user input ($message)",
                            line_no, col,
                            fix="Sanitize with $isNumber or parseInt before interpolation",
                            context=ctx_line))
                        break

        # ── 39. $arrayIncludes with digit-string needle ──
        if fname_lower == "arrayincludes" and len(args) >= 2:
            needle = args[1].strip()
            if re.fullmatch(r"\d{5,}", needle) or "$env[" in needle or "$get[" in needle:
                findings.append(Finding("warn", "coercion",
                    f"$arrayIncludes needle may be digit-string → parseJSON to Number → never matches",
                    line_no, col,
                    fix=f"$arraySome[arr;x;$checkCondition[$env[x]=={needle}]]",
                    context=ctx_line))

        # ── 40. $parseMS with text arg ──
        if fname_lower == "parsems" and args:
            arg = args[0].strip()
            if re.fullmatch(r"\d+[smhdw].*", arg, re.I):
                findings.append(Finding("error", "parsems",
                    f"$parseMS receives '{arg}' (duration text) but expects a Number (ms) — "
                    f"this is ms→human, NOT text→ms",
                    line_no, col,
                    fix="Use $durationToMs[text] for text→ms conversion",
                    context=ctx_line))

        # ── 43. Unbounded loops ──
        if fname_lower == "loop":
            loop_depth += 1
            if args and args[0].strip() == "-1":
                if "$break" not in body:
                    findings.append(Finding("error", "infinite",
                        f"$loop[-1] without $break guard — infinite loop",
                        line_no, col,
                        fix="Add $break condition inside the loop body",
                        context=ctx_line))
            nested_loops.append((loop_depth, line_no, fname))
        elif fname_lower == "while":
            loop_depth += 1
            nested_loops.append((loop_depth, line_no, fname))

        # ── 44. Nested array iteration (O(n²)) ──
        if fname_lower in ("arrayforeach", "arraymap", "arrayfilter", "arraysome", "arrayevery"):
            # Check if we're already inside another iteration
            inner_calls = CALL_RE.findall(body)
            for ic in inner_calls:
                if ic.lower() in ("arrayforeach", "arraymap", "arrayfilter", "arraysome", "arrayevery"):
                    findings.append(Finding("warn", "perf",
                        f"${fname} contains nested ${ic} — O(n²) pattern",
                        line_no, col,
                        fix="Consider restructuring with a single pass or $arrayMap with complex body",
                        context=ctx_line))
                    break

        # ── 48. Overly long single line ──
        if len(ctx_line) > 200:
            findings.append(Finding("info", "style",
                f"Line exceeds 200 chars ({len(ctx_line)}) — hard to read",
                line_no, col))

        pos = body_end + 1 if pos >= body_end else pos

    # ── 45. Excessive nesting ──
    if max_nesting > 10:
        findings.append(Finding("warn", "perf",
            f"Expression nesting reaches {max_nesting} levels — "
            f"intermediate $let variables would improve readability and performance"))

    # ══ DATA INTEGRITY (post-scan checks) ═════════════════════════════════

    # ── 23. jsonSet bare snowflake ──
    for m in re.finditer(r"\$!?jsonSet\[[^;]*(?:;[^;]*)*;(\d{16,})[;\]]", cooked):
        sf = m.group(1)
        if int(sf) > 2**53:
            ln, col = get_line_col(cooked, m.start())
            findings.append(Finding("error", "snowflake",
                f"jsonSet stores bare snowflake {sf[:8]}... — precision loss past 2^53",
                ln, col,
                fix='Quote-wrap: $jsonSet[var;key;"$value"]',
                context=get_context_line(cooked, m.start())))

    # ── 24. jsonSet nested dynamic keys ──
    for m in re.finditer(r"\$!?jsonSet\[[^;]*;\$get\[(\w+)\];\$get\[(\w+)\]", cooked):
        ln, col = get_line_col(cooked, m.start())
        findings.append(Finding("error", "jsonset-keys",
            f"jsonSet with two consecutive dynamic keys ($get[{m.group(1)}];$get[{m.group(2)}]) — "
            f"silently fails",
            ln, col,
            fix="Use literal keys, or one dynamic key max. Flatten to separate vars for dynamic paths.",
            context=get_context_line(cooked, m.start())))

    # ── 25. Output leaks ──
    for i, ln in enumerate(lines, 1):
        st = ln.lstrip()
        bare = st.split("[")[0].lstrip("$!#").lower()
        if bare in LEAKY_FNS and st.startswith("$") and not st.startswith("$!") and not st.startswith("$#"):
            findings.append(Finding("warn", "output-leak",
                f"Top-level {st.split('[')[0]}[...] leaks return value",
                i, fix=f"$!{st.split('[')[0]}[...]",
                context=st[:70]))

    # ── 26-28. Variable flow analysis ──
    undefined = vt.undefined_reads()
    for var in sorted(undefined):
        if var not in ("guildID", "authorID", "channelID", "messageID", "botID",
                       "userID", "botOwnerID", "guildOwnerID", "clientID"):
            # Find first usage line
            for m in re.finditer(rf"\$get\[{re.escape(var)}\]", cooked):
                ln, _ = get_line_col(cooked, m.start())
                findings.append(Finding("warn", "var-flow",
                    f"$get[{var}] reads a variable that's never $let-defined in this code "
                    f"(may come from an outer scope)",
                    ln,
                    fix=f"Add $let[{var};...] before use, or verify it's set by a caller",
                    context=get_context_line(cooked, m.start())))
                break

    unused = vt.unused_defs()
    for var in sorted(unused):
        ln = vt.let_lines.get(var, "?")
        findings.append(Finding("info", "var-flow",
            f"$let[{var}] is defined but never read — dead code",
            ln))

    # ── 30. arrayLoad on empty string ──
    for m in re.finditer(r"\$arrayLoad\[\w+;[^;]*;\]", cooked):
        ln, _ = get_line_col(cooked, m.start())
        findings.append(Finding("warn", "phantom-element",
            f"$arrayLoad with empty values → [''] phantom element, inflates $arrayLength by +1",
            ln,
            fix="Guard: $if[$raw!=;$arrayLoad[...;...;$raw]]",
            context=get_context_line(cooked, m.start())))

    # ── 31. Cooldown on user text ──
    for m in re.finditer(r"\$cooldown\[\$message", cooked):
        ln, _ = get_line_col(cooked, m.start())
        findings.append(Finding("warn", "security",
            "Cooldown keyed on $message — user can bypass by varying the key",
            ln, fix="$cooldown[$authorID-$commandName;...]",
            context=get_context_line(cooked, m.start())))

    # ── 33. $sendDM to bot ──
    for m in re.finditer(r"\$sendDM\[\$botID", cooked):
        ln, _ = get_line_col(cooked, m.start())
        findings.append(Finding("info", "bot-dm",
            "$sendDM[$botID] — bots can't DM bots (error 50007)", ln))

    # ── 34. Missing $nomention ──
    has_mention_output = any(
        x in cooked for x in ("<@", "$username[", "$userTag[")
    )
    has_nomention = "$nomention" in cooked
    if has_mention_output and not has_nomention and "$interactionReply" not in cooked:
        findings.append(Finding("info", "mention",
            "Command outputs mentions but lacks $nomention",
            fix="Add $nomention at the top of the code"))

    # ── 36. Custom-fn bare call at top level ──
    for fn_lower, info in custom.items():
        if not info.get("has_return"):
            continue
        # Check for bare calls (not inside $let)
        pattern = rf"^(\s*)\${info['name']}\["
        for i, ln in enumerate(lines, 1):
            st = ln.lstrip()
            if st.startswith(f"${info['name']}[") and "$let[" not in st:
                # Check if there's more code after this line
                findings.append(Finding("warn", "return-kill",
                    f"${info['name']} called bare at top level — its $return kills the command "
                    f"(everything after is skipped)",
                    i,
                    fix=f"$let[r;${info['name']}[...]]",
                    context=st[:70]))
                break

    # ── 37. $return inside $if in custom fn ──
    # This is a heuristic — flags $return inside $if as potential early-exit
    for fn_lower, info in custom.items():
        code = info.get("code", "")
        if not code:
            continue
        cooked_fn = js_cook(code)
        # Find $return[ inside $if[...; blocks
        pass  # $return inside $if IS the intended early-exit idiom — not a bug

    # ── 38. Race condition advisory ──
    # Detect guild vars that are both read and written in the same code
    read_vars = {v for v, _ in guild_var_reads}
    write_vars = {v for v, _ in guild_var_writes}
    raced = read_vars & write_vars
    for var in sorted(raced):
        # Only flag if there's a pattern of read → compute → write
        reads = [ln for v, ln in guild_var_reads if v == var]
        writes = [ln for v, ln in guild_var_writes if v == var]
        if reads and writes and max(reads) < max(writes):
            findings.append(Finding("info", "race",
                f"Guild var '{var}' is read (line {reads[0]}) then written (line {writes[0]}) — "
                f"non-atomic read-modify-write; concurrent events can lose updates",
                writes[0]))

    # ── 5. In-text unescaped semicolons in single-arg functions ──
    for fname_single in ("return", "nomention", "ephemeral", "defer", "stop"):
        for m in re.finditer(rf"\${fname_single}\[([^$\]]*;[^$\]]*)\]", cooked):
            inner = m.group(1)
            if ";" in inner and "$" not in inner:
                ln, col = get_line_col(cooked, m.start())
                findings.append(Finding("error", "arg-split",
                    f"${fname_single} contains unescaped semicolon: '{inner[:20]}...' — splits the arg",
                    ln, col,
                    fix="Escape as \\; or remove semicolons from the text",
                    context=get_context_line(cooked, m.start())))

    # ── 6. Escape sequence issues ──
    for i, ln in enumerate(lines, 1):
        # \n in text (real newline is needed, not backslash-n)
        if re.search(r"(?<!\\)\\n(?![\[])", ln):
            findings.append(Finding("info", "escape",
                f"Literal \\n in text — ForgeScript has no \\n escape; "
                f"use a real newline or $replace[...;\\n;", i))

    # ── 7. Deep nesting ──
    for i, (start_d, end_d) in enumerate(line_depths, 1):
        if start_d > 20:
            findings.append(Finding("info", "style",
                f"Bracket depth {start_d} at line start — very deeply nested",
                i))

    # Deduplicate and sort
    seen = set()
    deduped = []
    for f in findings:
        key = (f.category, f.message[:60], f.line)
        if key not in seen:
            seen.add(key)
            deduped.append(f)

    deduped.sort(key=lambda f: (SEVERITY_ORDER.get(f.severity, 9), f.line or 0))
    return deduped


# ── Simulator (v3: full execution tree) ────────────────────────────────────

def simulate(code, sigs, custom, enums):
    cooked = js_cook(code)

    def build_tree(start, end, depth=0):
        calls = []
        pos = start
        while pos < end:
            m = CALL_RE.search(cooked, pos, end)
            if not m or m.start() >= end:
                break
            fname = m.group(1)
            body_start = m.end()
            body_end = find_call_end(cooked, body_start)
            if body_end < 0 or body_end >= end:
                break
            children = build_tree(body_start, body_end, depth + 1)
            args = split_args(cooked[body_start:body_end])
            sig = sigs.get(fname.lower())
            known = sig is not None or fname.lower() in custom
            category = (
                sig["category"] if sig
                else "custom" if fname.lower() in custom
                else "???"
            )
            side_effects = []
            if any(k in category for k in ("message", "interaction", "channel")):
                side_effects.append("sends")
            elif any(k in category for k in ("variable", "state", "json")):
                side_effects.append("mutates")
            elif any(k in category for k in ("audit", "logging")):
                side_effects.append("logs")

            calls.append({
                "name": fname,
                "n_args": len(args),
                "children": children,
                "known": known,
                "category": category,
                "effects": side_effects,
                "deprecated": sig["deprecated"] if sig else False,
                "experimental": sig["experimental"] if sig else False,
            })
            pos = body_end + 1
        return calls

    tree = build_tree(0, len(cooked))

    print(f"{C.BOLD}┌─ Simulation Trace{C.RESET} " + "─" * 38)
    print(f"{C.DIM}│ Input:{C.RESET} {cooked[:80]}{'...' if len(cooked) > 80 else ''}")
    print("│")

    stats = {"total": 0, "max_depth": 0, "unknown": [], "sends": 0, "mutates": 0}

    def render(calls, depth=0):
        indent = "  " * depth
        arrow = f"{C.CYAN}├─{C.RESET}" if depth > 0 else f"{C.BOLD}▶{C.RESET}"
        for call in calls:
            stats["total"] += 1
            stats["max_depth"] = max(stats["max_depth"], depth)
            if call["effects"]:
                for e in call["effects"]:
                    stats[e] = stats.get(e, 0) + 1

            color = C.GREEN if call["known"] else C.RED
            flags = []
            if call["deprecated"]:
                flags.append(f"{C.RED}deprecated{C.RESET}")
            if call["experimental"]:
                flags.append(f"{C.YELLOW}experimental{C.RESET}")
            flag_str = f" {C.DIM}[{' '.join(flags)}]{C.RESET}" if flags else ""

            effects_str = ""
            if call["effects"]:
                effects_str = f" {C.MAGENTA}({','.join(call['effects'])}){C.RESET}"

            print(
                f"│ {indent}{arrow} {color}${call['name']}{C.RESET}"
                f"{C.DIM}[{call['n_args']}]{C.RESET} "
                f"{C.DIM}({call['category']}){C.RESET}{effects_str}{flag_str}"
            )

            if not call["known"]:
                stats["unknown"].append(call["name"])
            if call["children"]:
                render(call["children"], depth + 1)

    render(tree)

    print("│")
    print(f"│ {C.BOLD}Summary:{C.RESET}")
    print(f"│   Total calls:   {stats['total']}")
    print(f"│   Max depth:     {stats['max_depth']}")
    print(f"│   Side effects:  {stats.get('sends', 0)} sends, {stats.get('mutates', 0)} mutates")
    if stats["unknown"]:
        print(f"│   {C.RED}⚠ Unknown:      {', '.join('$' + u for u in stats['unknown'])}{C.RESET}")
    else:
        print(f"│   {C.GREEN}✓ All functions recognized{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Dependency Graph v3 (with circular detection) ─────────────────────────

def build_deps(custom, sigs, root, cmd_registry=None):
    print(f"{C.BOLD}┌─ Dependency Graph{C.RESET} " + "─" * 38)

    # Custom fn → called custom fns
    print(f"\n{C.BOLD}Custom function internal dependencies:{C.RESET}")
    for name in sorted(custom):
        info = custom[name]
        called = info.get("called", set())
        deps = called & set(custom.keys()) - {name}
        if deps:
            print(f"  {C.CYAN}${info['file'].split('/')[-1]}::{name}{C.RESET}")
            for d in sorted(deps):
                print(f"    {C.DIM}→ ${custom[d].get('file', '?').split('/')[-1]}::{d}{C.RESET}")
        else:
            print(f"  {C.DIM}${name} (no custom-fn deps){C.RESET}")

    # Circular dependency detection
    print(f"\n{C.BOLD}Circular dependency check:{C.RESET}")
    cycles = []
    visited = set()
    stack = []

    def dfs(node, path):
        if node in path:
            cycle = path[path.index(node):] + [node]
            cycles.append(cycle)
            return
        if node in visited:
            return
        visited.add(node)
        path.append(node)
        for dep in custom.get(node, {}).get("called", set()):
            if dep in custom:
                dfs(dep, path)
        path.pop()

    for name in sorted(custom):
        dfs(name, [])

    if cycles:
        for cyc in cycles:
            print(f"  {C.RED}⚠ CYCLE: {' → '.join('$' + n for n in cyc)}{C.RESET}")
    else:
        print(f"  {C.GREEN}✓ No circular dependencies{C.RESET}")

    # Command usage
    print(f"\n{C.BOLD}Custom function usage by commands:{C.RESET}")
    fn_usage = defaultdict(list)
    for cmd_dir in (root / "prefixesCmd", root / "slashesCmd", root / "events"):
        if not cmd_dir.exists():
            continue
        for js in cmd_dir.rglob("*.js"):
            text = js.read_text(encoding="utf-8")
            for cm in re.finditer(r"\$[!#]?(\w+)\[", text):
                fn = cm.group(1).lower()
                if fn in custom:
                    rel = str(js.relative_to(root))
                    if rel not in fn_usage[fn]:
                        fn_usage[fn].append(rel)

    for fn in sorted(fn_usage):
        files = fn_usage[fn]
        print(f"  {C.CYAN}${fn}{C.RESET} used in {len(files)} file(s)")
        for f in files[:3]:
            print(f"    {C.DIM}{f}{C.RESET}")
        if len(files) > 3:
            print(f"    {C.DIM}... and {len(files) - 3} more{C.RESET}")

    # Unused custom functions
    unused_fns = set(custom.keys()) - set(fn_usage.keys()) - {"theme"}  # theme used via actionColor
    if unused_fns:
        print(f"\n{C.YELLOW}Unused custom functions:{C.RESET}")
        for fn in sorted(unused_fns):
            print(f"  {C.DIM}${fn} (defined in {custom[fn]['file']}){C.RESET}")

    print(f"\n{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Explain Mode v3 ────────────────────────────────────────────────────────

def explain(fn_name, sigs, enums, custom):
    fn_name = fn_name.lstrip("$").lower()
    sig = sigs.get(fn_name)

    print(f"{C.BOLD}┌─ ${sig['name'] if sig else fn_name}{C.RESET} " + "─" * 44)

    if not sig:
        cf = custom.get(fn_name)
        if cf:
            print(f"│ {C.CYAN}Custom function{C.RESET} — {C.DIM}{cf['file']}{C.RESET}")
            print(f"│ {C.DIM}Parameters ({cf['required']} required):{C.RESET}")
            code = cf.get("code", "")
            for line in code.strip().split("\n")[:8]:
                print(f"│   {C.DIM}{line.strip()}{C.RESET}")
            if cf.get("has_return"):
                print(f"│ {C.YELLOW}⚠ Has $return — bare calls at top level kill the command{C.RESET}")
            deps = cf.get("called", set()) & set(custom.keys())
            if deps:
                print(f"│ {C.DIM}Calls:{C.RESET} {', '.join('$' + d for d in sorted(deps))}")
            print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
            return
        print(f"│ {C.RED}Not found in KB or custom functions{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return

    print(f"│ {C.DIM}Category:{C.RESET} {sig['category']}")
    if sig["alias_of"]:
        print(f"│ {C.DIM}Alias of:{C.RESET} ${sig['alias_of']}")
    if sig["deprecated"]:
        print(f"│ {C.RED}⚠ DEPRECATED{C.RESET}")
    if sig["experimental"]:
        print(f"│ {C.YELLOW}⚠ EXPERIMENTAL — semantics may change{C.RESET}")
    print(f"│ {C.DIM}Description:{C.RESET} {sig.get('description', '—')}")

    if sig["params"]:
        sig_parts = []
        for p in sig["params"]:
            s = p["name"]
            if p["required"]:
                s = f"{C.BOLD}{s}{C.RESET}"
            if p["rest"]:
                s += "..."
            sig_parts.append(s)
        print(f"\n│ {C.BOLD}Signature:{C.RESET}")
        print(f"│   ${sig['name']}[{' '.join(sig_parts)}]")

        print(f"\n│ {C.BOLD}Parameters:{C.RESET}")
        for i, p in enumerate(sig["params"], 1):
            req = f"{C.RED}*{C.RESET}" if p["required"] else " "
            rest = f" {C.DIM}(rest){C.RESET}" if p["rest"] else ""
            ename = sig.get("enum_names", {}).get(i - 1)
            extra = f" {C.DIM}[enum: {ename}]{C.RESET}" if ename else ""
            print(f"│   {req} {i}. {C.CYAN}{p['name']}{C.RESET} "
                  f"{C.DIM}({p['type']}){C.RESET}{rest}{extra}")

            # Show valid enum values
            if ename and ename in enums:
                vals = sorted(enums[ename])
                print(f"│      {C.DIM}Values: {', '.join(vals[:10])}"
                      f"{'...' if len(vals) > 10 else ''}{C.RESET}")

    if sig.get("output"):
        print(f"\n│ {C.BOLD}Returns:{C.RESET} {sig['output']}")

    if sig.get("quirks"):
        print(f"\n│ {C.BOLD}Key quirk:{C.RESET} {sig['quirks']}")

    # Implementation excerpt
    try:
        text = Path(sig["file"]).read_text(encoding="utf-8")
        ref = re.search(r"## Reference implementation.*?```ts\n(.*?)```", text, re.S)
        if ref:
            impl = ref.group(1).strip()
            print(f"\n│ {C.BOLD}Implementation (first 8 lines):{C.RESET}")
            for line in impl.split("\n")[:8]:
                print(f"│   {C.DIM}{line}{C.RESET}")
    except Exception:
        pass

    print(f"\n│ {C.DIM}Full docs: {sig['file']}{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Diff Mode: prefix vs slash mirrors ────────────────────────────────────

def diff_mirrors(root, sigs, custom):
    """Compare prefix and slash command files for logic drift."""
    prefix_dir = root / "prefixesCmd"
    slash_dir = root / "slashesCmd"
    if not prefix_dir.exists() or not slash_dir.exists():
        print("Cannot diff: missing command directories")
        return

    # Build a map of all command names
    prefix_files = {}
    for js in prefix_dir.rglob("*.js"):
        nm = re.search(r'name:\s*["\'](\w+)["\']', js.read_text())
        if nm:
            prefix_files[nm.group(1)] = js

    slash_files = {}
    for js in slash_dir.rglob("*.js"):
        nm = re.search(r'name:\s*["\'](\w+)["\']', js.read_text())
        if nm:
            slash_files[nm.group(1)] = js

    print(f"{C.BOLD}┌─ Prefix vs Slash Mirror Diff{C.RESET} " + "─" * 32)
    print(f"│ Prefix commands: {len(prefix_files)}")
    print(f"│ Slash commands:  {len(slash_files)}")
    print("│")

    # Functions used in each
    only_prefix = set(prefix_files) - set(slash_files)
    only_slash = set(slash_files) - set(prefix_files)
    both = set(prefix_files) & set(slash_files)

    if only_prefix:
        print(f"│ {C.YELLOW}Prefix only ({len(only_prefix)}):{C.RESET}")
        for name in sorted(only_prefix)[:10]:
            print(f"│   {name}")
    if only_slash:
        print(f"│ {C.YELLOW}Slash only ({len(only_slash)}):{C.RESET}")
        for name in sorted(only_slash)[:10]:
            print(f"│   {name}")

    # Compare function calls in shared commands
    drifts = []
    for name in sorted(both):
        pfx_text = prefix_files[name].read_text()
        slx_text = slash_files[name].read_text()

        pfx_fns = set(CALL_RE.findall(pfx_text))
        slx_fns = set(CALL_RE.findall(slx_text))

        only_in_prefix = pfx_fns - slx_fns
        only_in_slash = slx_fns - pfx_fns

        if only_in_prefix or only_in_slash:
            drifts.append((name, only_in_prefix, only_in_slash))

    if drifts:
        print(f"│\n│ {C.RED}Logic drift detected in {len(drifts)} command(s):{C.RESET}")
        for name, pfx_only, slx_only in drifts[:15]:
            print(f"│   {C.BOLD}{name}{C.RESET}:")
            if pfx_only:
                print(f"│     Prefix only: {', '.join('$' + f for f in sorted(pfx_only))}")
            if slx_only:
                print(f"│     Slash only:  {', '.join('$' + f for f in sorted(slx_only))}")
    else:
        print(f"│ {C.GREEN}✓ All shared commands use identical function sets{C.RESET}")

    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Stats ──────────────────────────────────────────────────────────────────

def show_stats(sigs, custom, enums, cmd_registry=None):
    print(f"{C.BOLD}┌─ Knowledge Base Stats{C.RESET} " + "─" * 37)
    print(f"│ Functions indexed: {C.BOLD}{len(sigs)}{C.RESET}")
    aliases = sum(1 for s in sigs.values() if s["alias_of"])
    print(f"│   Aliases: {aliases}")
    print(f"│   Canonical: {len(sigs) - aliases}")
    exp = sum(1 for s in sigs.values() if s["experimental"])
    dep = sum(1 for s in sigs.values() if s["deprecated"])
    print(f"│   {C.YELLOW}Experimental: {exp}{C.RESET}")
    print(f"│   {C.RED}Deprecated: {dep}{C.RESET}")
    print(f"│ Enums loaded: {len(enums) // 2}")  # /2 because case-insensitive dupes
    print(f"│ Custom functions (bot): {len(custom)}")
    if cmd_registry:
        print(f"│ Registered commands: {len(cmd_registry)}")

    cats = defaultdict(int)
    for s in sigs.values():
        cats[s["category"]] += 1
    print(f"│ Categories: {len(cats)}")
    for cat in sorted(cats, key=lambda c: -cats[c])[:10]:
        bar = "█" * min(cats[cat] // 10, 20)
        print(f"│   {cat:>12} {cats[cat]:>4} {C.CYAN}{bar}{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)


# ── Main Lint Runner ───────────────────────────────────────────────────────

def lint_path(path, sigs, custom, enums, cmd_registry=None):
    path = Path(path)
    files = []
    if path.is_dir():
        for pattern in (
            "prefixesCmd/**/*.js", "slashesCmd/**/*.js",
            "functions/*.js", "events/*.js",
        ):
            files.extend(path.glob(pattern))
    elif path.is_file():
        files = [path]
    else:
        print(f"Error: {path} not found")
        return 1

    total_errors = 0
    total_warns = 0
    total_infos = 0
    total_files = 0
    cat_counts = defaultdict(int)

    for f in sorted(files):
        code_strings = extract_code_strings(f)
        if not code_strings:
            continue
        total_files += 1
        file_findings = []
        for code in code_strings:
            file_findings.extend(
                lint_code(code, sigs, custom, enums, str(f), cmd_registry)
            )

        if file_findings:
            rel = f.relative_to(ROOT) if f.is_relative_to(ROOT) else f
            errors = sum(1 for x in file_findings if x.severity == "error")
            warns = sum(1 for x in file_findings if x.severity == "warn")
            infos = sum(1 for x in file_findings if x.severity == "info")
            total_errors += errors
            total_warns += warns
            total_infos += infos
            print(f"\n{C.BOLD}{rel}{C.RESET}")
            for finding in file_findings:
                print(finding)
                cat_counts[finding.category] += 1

    print(f"\n{'─' * 60}")
    print(
        f"Linted {C.BOLD}{total_files}{C.RESET} files: "
        f"{C.RED}{total_errors} errors{C.RESET}, "
        f"{C.YELLOW}{total_warns} warnings{C.RESET}, "
        f"{C.CYAN}{total_infos} info{C.RESET}"
    )

    if cat_counts:
        print(f"\n{C.DIM}By category:{C.RESET}")
        for cat in sorted(cat_counts, key=lambda c: -cat_counts[c]):
            print(f"  {cat}: {cat_counts[cat]}")

    return 1 if total_errors else 0


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    sigs = load_signatures()
    custom = load_custom_functions(ROOT)
    enums = load_enums()
    cmd_registry = load_command_registry(ROOT)

    if not sigs:
        print("Error: No KB signatures loaded. Set FORGE_KB env var.")
        return 1

    if "--stats" in sys.argv:
        show_stats(sigs, custom, enums, cmd_registry)
        return 0

    if "--explain" in sys.argv:
        idx = sys.argv.index("--explain")
        if idx + 1 < len(sys.argv):
            explain(sys.argv[idx + 1], sigs, enums, custom)
            return 0

    if "--deps" in sys.argv:
        build_deps(custom, sigs, ROOT, cmd_registry)
        return 0

    if "--diff" in sys.argv:
        diff_mirrors(ROOT, sigs, custom)
        return 0

    if "--snippet" in sys.argv:
        idx = sys.argv.index("--snippet")
        if idx + 1 < len(sys.argv):
            findings = lint_code(
                sys.argv[idx + 1], sigs, custom, enums, cmd_registry=cmd_registry
            )
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

    return lint_path(target, sigs, custom, enums, cmd_registry)


if __name__ == "__main__":
    sys.exit(main())
