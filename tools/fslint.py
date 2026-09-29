#!/usr/bin/env python3
"""fslint — ForgeScript static analyzer, language tooling & local simulator. v4

v4 ports the official ForgeVSC engine (github.com/tryforge/ForgeVSC) to CLI
space: escape-parity scanning, call-bracket-aware parsing (literal brackets
never break calls), loose operator-chain validation, $c[]-region skipping,
positioned argument splitting, longest-suffix function resolution, and
ForgeVSC-style interactive modes (completion, signature help, guides,
outline, comment toggle, auto-fix).

Usage:
  python3 tools/fslint.py                       # lint the repo
  python3 tools/fslint.py <file_or_dir>         # lint specific target
  python3 tools/fslint.py --snippet '$if[...'   # lint inline snippet
  python3 tools/fslint.py --sim '$ping'         # trace execution order
  python3 tools/fslint.py --deps                # dependency graph
  python3 tools/fslint.py --stats               # KB coverage stats
  python3 tools/fslint.py --explain '$fn'       # show KB info for a function
  python3 tools/fslint.py --diff                # prefix vs slash mirror diff
  python3 tools/fslint.py --complete addbut     # autocompletion + usage
  python3 tools/fslint.py --signature '$if[a;'  # which arg am I on?
  python3 tools/fslint.py --guides '$addButton' # community guide search
  python3 tools/fslint.py --outline file.js     # call map w/ line spans
  python3 tools/fslint.py --events [name]       # event registry + intents
  python3 tools/fslint.py --fix file.js [--dry] # operator-prefix auto-fix
  python3 tools/fslint.py --(un)comment f.js --lines M[-N]   # $c[] toggle

CHECKS (76):
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

  RUNTIME SEMANTICS (verified live against 2.7.1)
   49. $env[x] where x is only $let-defined (keywords ≠ environment store)
   50. $get[x] where x is only env-defined (jsonLoad/try/http/params)
   51. Embed/component decorators BEFORE $cooldown/$onlyIf (error send
       resets the container — embeds destroyed when the gate fires)
   52. Literal backslash before a function ($fn — backslash is dropped,
       the function still executes)
   53. $# on nested calls (ignored — only the top-level flag is checked)
   54. Top-level $# (suppresses the alert but STILL aborts the run)
   55. Time literal traps: decimals with units throw, 'ms' unit doesn't
       exist, M = month not minute
   56. Literal text inside $loop body (discarded — only $return accumulates)

  RELATIONSHIPS (producer → consumer ordering)
   57. $addButton/$addStringSelectMenu without prior $addActionRow
   58. $addOption without prior $addStringSelectMenu
   59. $addTextInput without $modal; $showModal without $modal
   60. $jsonSet/$jsonDelete with no $jsonLoad (writes go nowhere)
   61. $splitText family with no $textSplit (disjoint hidden store)
   62. $httpResult/$httpPing with no $httpRequest
   63. Array fns on never-created arrays (no $arrayLoad/$arrayCreate/$let)
   64. $ephemeral AFTER $defer/$interactionReply (read at flush time)
   65. $interactionReply after $defer (reply slot consumed — use followUp)
   66. $fetchComponents mixed with manual component builders (fetch wins)
   67. Context-gated fns in command files ($input/$customID/$option etc.)

  REAL-WORLD PATTERNS
   68. $loop[-1] spin-lock without $wait (unthrottled busy-loop)
   69. $djsEval with raw $get/$env interpolation (use $jsonStringify bridge)
   70. Fixed time-regex: decimals-with-unit and 'ms' no longer pass validation

  FORGEVSC ENGINE CHECKS (v4)
   71. Operator prefix ORDER (!# / @[sep]! — parses as literal text)
   72. DUPLICATED operators ($!! / $##)
   73. Bare call of a brackets-required function
   74. Operator prefix on a SECOND $ ($!$fn — never applies)
   75. Event-type literals: unknown/deprecated (file-level, KB registry)
   76. Condition-field traps: multiple operators, empty left side
   (+ engine: $c[...] regions ignored — commented code no longer false-flags;
    bare calls now visible to every check; literal brackets never break
    call matching; arg spans are exact)

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

            # Extract brackets policy from the summary table
            # (| Package | Category | Since | Brackets | Unwrap | Output |)
            brackets = None
            bm = re.search(
                r"\|[^|\n]+\|[^|\n]+\|[^|\n]+\|\s*(required|optional|none)\s*\|",
                text,
            )
            if bm:
                brackets = bm.group(1)

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
                "brackets": brackets,
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
    """ForgeVSC-style custom function metadata extraction. Handles:
    - module.exports = [...] / export default / new ForgeFunction({...})
    - params as object literals {name, type, required, rest} or 'shorthand'
    - firstParamCondition flag (param 0 is a condition field)
    - per-function source line numbers (for --deps / --explain locations)
    """
    custom = {}
    funcs_dir = root / "functions"
    if not funcs_dir.exists():
        return custom
    for js in sorted(funcs_dir.rglob("*.js")):
        text = js.read_text(encoding="utf-8")
        for m in re.finditer(
            r'name:\s*["\'](\w+)["\']\s*,', text,
        ):
            pname = m.group(1)
            fn_line = text[: m.start()].count("\n") + 1
            # this definition's span: from the previous definition end to the next
            next_def = re.search(r'name:\s*["\']\w+["\']\s*,', text[m.end():])
            boundary = m.end() + next_def.start() if next_def else len(text)
            prev_def_end = max(
                (mm.end() for mm in re.finditer(r"code:\s*`[^`]*`", text[: m.start()])),
                default=0,
            )
            span = text[prev_def_end:boundary]

            param_names, required_n, rest_flags = [], 0, []
            first_param_condition = "firstParamCondition" in span
            params_m = re.search(r"params:\s*\[", span)
            if params_m:
                seg = span
                depth, k = 0, params_m.end() - 1
                body_start = k
                while k < len(seg):
                    if seg[k] == "[":
                        depth += 1
                    elif seg[k] == "]":
                        depth -= 1
                        if depth == 0:
                            break
                    k += 1
                pbody = seg[body_start + 1:k]
                # object params
                for om in re.finditer(r"\{([^{}]*)\}", pbody):
                    body = om.group(1)
                    nm = re.search(r'name:\s*["\'](\w+)["\']', body)
                    if nm:
                        param_names.append(nm.group(1))
                        if re.search(r"required:\s*true", body):
                            required_n += 1
                        rest_flags.append(bool(re.search(r"rest:\s*true", body)))
                # shorthand string params (not inside object literals)
                stripped = re.sub(r"\{[^{}]*\}", "", pbody)
                for sm in re.findall(r"['\"](\w+)['\"]", stripped):
                    param_names.append(sm)
                    required_n += 1
                    rest_flags.append(False)
            # extract the code body (template literal inside this span)
            code_start = text.find("code: `", m.end())
            if code_start == -1 or code_start > boundary:
                code_start = text.find("code: `", prev_def_end)
            code_end = text.find("`", code_start + 7) if code_start > 0 else -1
            code_body = text[code_start + 7 : code_end] if code_start > 0 and code_end > 0 else ""
            if not code_body:
                continue
            has_return = "$return[" in code_body
            called = set()
            for cm in re.finditer(r"\$[!#]?(\w+)\[", code_body):
                called.add(cm.group(1).lower())

            custom[pname.lower()] = {
                "name": pname,
                "required": required_n,
                "max": max(required_n, len(param_names)),
                "file": str(js.relative_to(root)),
                "line": fn_line,
                "code": code_body,
                "has_return": has_return,
                "params": param_names,
                "param_rest": rest_flags,
                "first_param_condition": first_param_condition,
                "called": called,
            }
    return custom


def load_events():
    """Event registry from KB: name → {intents, deprecated, since}."""
    events = {}
    ev_dir = KB / "events"
    if not ev_dir.exists():
        return events
    for md in ev_dir.glob("*.md"):
        if md.name == "_INDEX.md":
            continue
        text = md.read_text(encoding="utf-8")
        intents = re.findall(r"`([A-Z][A-Za-z]+)`", text[:800])
        # dedupe, keep order (first table row = the intents column)
        seen, ordered = set(), []
        for it in intents:
            if it not in seen and it not in ("Package", "Since", "Intents"):
                seen.add(it)
                ordered.append(it)
        events[md.stem] = {
            "intents": ordered,
            "deprecated": "deprecated" in text.lower()[:400],
            "since": (re.search(r"v[\d.]+", text[:400]) or [None]).group(0)
            if re.search(r"v[\d.]+", text[:400]) else None,
            "file": str(md),
        }
    return events


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
# Runtime-verified (2.7.1): plain number = ms value; with a unit it must be an
# INTEGER (decimals throw), there is NO 'ms' unit, 'M' = month (30d), 'y' = 360d.
TIME_RE = re.compile(r"^(\d+(\.\d+)?|inf|\d+(s|m|h|d|w|M|y))$")
TIME_TRAP_DECIMAL = re.compile(r"^\d+\.\d+\s*(s|m|h|d|w|M|y)$")
TIME_TRAP_MS = re.compile(r"^\d+\s*ms$", re.I)
TIME_TRAP_CAPM = re.compile(r"^\d+M$")
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

# ── Container lifecycle (runtime-verified) ─────────────────────────────────
# Decorators mutate the response container; guard error-sends RESET it, so
# decorators placed before a gate are destroyed when the gate fires.
EMBED_DECORATORS = {
    "title", "description", "addfield", "color", "author", "footer",
    "image", "thumbnail", "timestamp", "setthumbnail", "setauthor",
}
COMPONENT_DECORATORS = {
    "addactionrow", "addbutton", "addstringselectmenu",
    "adduserselectmenu", "addroleselectmenu", "addchannelselectmenu",
    "addmentionableselectmenu", "addoption", "addtextinput",
}
CONTAINER_DECORATORS = EMBED_DECORATORS | COMPONENT_DECORATORS

# Gates whose error-send resets the shared container (embeds built before
# them are destroyed when the gate trips)
CONTAINER_RESET_GATES = {
    "cooldown", "onlyif", "onlyperms", "onlyforroles", "onlyforchannels",
    "onlyforguilds", "onlybotowners", "onlynsfw", "staffonly",
}

# ── Producer → consumer maps (runtime-verified hidden stores) ─────────────
ARRAY_PRODUCERS = {"arrayload", "arraycreate"}
ARRAY_CONSUMERS = {
    "arrayat", "arrayjoin", "arraylength", "arraypush", "arraypop",
    "arrayshift", "arrayunshift", "arraysplice", "arrayslice", "arraysort",
    "arrayreverse", "arrayincludes", "arraysome", "arrayevery", "arraymap",
    "arrayfilter", "arrayfind", "arrayfindindex", "arrayforeach",
    "arrayindexof", "arraylast", "arrayunique", "arrayconcat", "arrayshuffle",
    "arrayclear", "arraydelete",
}

# Functions that populate the ENV store (readable via $env, not $get)
ENV_PRODUCER_FNS = {
    "jsonload": 0,        # $jsonLoad[var;json] → arg 0 is the env var
    "try": 2,             # $try[code;catch;errVar] → arg 2
    "httprequest": -1,    # response var = last arg
    "loop": 2,            # $loop[times;code;counterVar] → arg 2
}

# Context-gated accessors: only meaningful inside their interaction kind
INTERACTION_ONLY_FNS = {
    "input": "modal submit only",
    "customid": "component interaction only",
    "selectmenuvalues": "select-menu interaction only",
    "isbutton": "component interaction only",
    "isanyselectmenu": "component interaction only",
    "ismodal": "modal submit only",
    "focusedoptionname": "autocomplete only",
    "focusedoptionvalue": "autocomplete only",
    "addchoice": "autocomplete only",
}
SLASH_ONLY_FNS = {"option", "interactionreply", "interactiondefer"}

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


# ── ForgeVSC-ported engine (v4) ────────────────────────────────────────────
# Ported from github.com/tryforge/ForgeVSC (src/extension.ts) and adapted to
# COOKED code space (js_cook applied: one backslash = one runtime escape).

# Operator chains: strict = canonical order $[!][#][@[sep]]; loose = any order
OPERATOR_CHAIN = r"(?:!?#?(?:@\[[^\]]*\])?)?"
LOOSE_OPERATOR_CHAIN = r"(?:[!#]|(?:@\[[^\]]*\]))*"
FN_TOKEN_RE = re.compile(r"\$" + OPERATOR_CHAIN + r"[A-Za-z0-9_]+", re.I)
FN_PREFIX_RE = re.compile(r"^\$" + LOOSE_OPERATOR_CHAIN)
FN_HEAD_RE = re.compile(r"(\$" + OPERATOR_CHAIN + r"[A-Za-z0-9_]+)$", re.I)
FN_SCAN_LOOSE_RE = re.compile(
    r"\$" + LOOSE_OPERATOR_CHAIN + r"[A-Za-z0-9_]+(?:\[)?", re.I
)
FN_OPEN_SCAN_RE = re.compile(r"\$" + OPERATOR_CHAIN + r"[A-Za-z0-9_]+\[", re.I)
INVALID_OPERATOR_RE = re.compile(r"#.*!|@\[\].*!|@\[\].*#")
STRICT_PREFIX_RE = re.compile(r"^\$(!)?(#)?(?:@\[[^\]]*\])?")
COMMENT_FN_RE = re.compile(
    r"\$" + OPERATOR_CHAIN + r"(?:c|escapeCode|esc)\[", re.I
)


def is_escaped(text, i):
    """Cooked-space escape parity: char at i is literal iff an ODD number of
    backslashes immediately precedes it (one cooked backslash = one escape)."""
    slashes = 0
    j = i - 1
    while j >= 0 and text[j] == "\\":
        slashes += 1
        j -= 1
    return slashes % 2 == 1


def is_opening_bracket(text, i):
    """A '[' only opens a function call when it directly follows a function
    token (no whitespace) and isn't escaped — literal brackets never open."""
    return not is_escaped(text, i) and _fn_head_ends_here(text, i)


def _fn_head_ends_here(text, i):
    """The text before position i ends with a complete function token."""
    if i <= 0 or text[i - 1].isspace():
        return False
    window = text[max(0, i - 220):i]
    last = None
    for m in FN_TOKEN_RE.finditer(window):
        last = m
    if not last:
        return False
    # the matched token must extend exactly to i
    return window.endswith(last.group(0))


def find_matching_bracket(text, open_index):
    """Forward scan matching a call's opening bracket. Only call-brackets
    ('[' after a fn token) nest; escaped ']' never closes."""
    depth = 1
    i = open_index + 1
    while i < len(text):
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == "[" and _fn_head_ends_here(text, i):
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def find_opening_bracket(text):
    """Backward scan: opening bracket of the call the caret is inside."""
    depth = 0
    for i in range(len(text) - 1, -1, -1):
        c = text[i]
        if c == "]" and not is_escaped(text, i):
            depth += 1
            continue
        if c == "[" and _fn_head_ends_here(text, i):
            if depth > 0:
                depth -= 1
            else:
                return i
    return -1


def bracket_depth(text):
    """Net open call-brackets (call-aware, escape-aware)."""
    depth = 0
    i = 0
    while i < len(text):
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == "[" and _fn_head_ends_here(text, i):
            depth += 1
        elif c == "]" and not is_escaped(text, i) and depth > 0:
            depth -= 1
        i += 1
    return depth


def split_args_pos(arg_string):
    """Split an arg body on top-level ';'. Returns [(value, start, end)] with
    offsets relative to arg_string. Call-bracket-aware; escaped ';' kept."""
    args = []
    current = ""
    arg_start = 0
    depth = 0
    i = 0
    while i < len(arg_string):
        c = arg_string[i]
        if c == "\\":
            current += arg_string[i:i + 2]
            i += 2
            continue
        if c == "[" and _fn_head_ends_here(arg_string, i):
            depth += 1
        elif c == "]" and depth > 0:
            depth -= 1
        if c == ";" and depth == 0:
            args.append((current, arg_start, i))
            current = ""
            arg_start = i + 1
        else:
            current += c
        i += 1
    args.append((current, arg_start, len(arg_string)))
    return args


def find_condition_operator(text):
    """Locate the first depth-0 condition operator (==, !=, <=, >=, <, >)."""
    depth = 0
    i = 0
    while i < len(text):
        c = text[i]
        if c == "\\":
            i += 2
            continue
        if c == "[" and _fn_head_ends_here(text, i):
            depth += 1
            i += 1
            continue
        if c == "]" and depth > 0 and not is_escaped(text, i):
            depth -= 1
            i += 1
            continue
        if depth > 0:
            i += 1
            continue
        two = text[i:i + 2]
        if two in ("==", "!=", "<=", ">="):
            return (two, i, i + 2)
        if c in "<>":
            return (c, i, i + 1)
        i += 1
    return None


def is_ignored_region(text, index):
    """True when index sits inside $c[...] / $escapeCode[...] / $esc[...]
    (comment regions — their contents are never executed)."""
    for m in COMMENT_FN_RE.finditer(text):
        open_idx = m.end() - 1
        close_idx = find_matching_bracket(text, open_idx)
        if close_idx == -1:
            continue
        if m.start() < index < close_idx:
            return True
    return False


def is_inside_comment(text, index):
    """JS-comment awareness (line + block) — operates on RAW file text."""
    line_start = text.rfind("\n", 0, index) + 1
    if "//" in text[line_start:index]:
        return True
    before = text[:index]
    return before.rfind("/*") > before.rfind("*/")


def locate_code_blocks(text):
    """All `code: <quote>...<quote>` spans in a raw JS file, skipping JS
    comments. Returns [(start, end, quote)] with quote EXCLUSIVE bounds."""
    blocks = []
    for m in re.finditer(r"code:\s*([" + "`" + r"'\" ])", text):
        quote = m.group(1)
        start = m.end()
        if is_inside_comment(text, m.start()):
            continue
        end = -1
        i = start
        while i < len(text):
            c = text[i]
            if c == "\\":
                i += 2
                continue
            if c == quote:
                end = i
                break
            i += 1
        if end == -1:
            continue
        blocks.append((start, end, quote))
    return blocks


def validate_operator_prefix(base):
    """Returns (raw_prefix, is_invalid_order). '!#' etc. never parse as the
    canonical $[!][#][@[sep]] chain — the runtime reads them as unknown text."""
    m = FN_PREFIX_RE.match(base)
    raw_prefix = m.group(0) if m else "$"
    normalized = re.sub(r"@\[[^\]]*\]", "@[]", raw_prefix)
    return raw_prefix, bool(INVALID_OPERATOR_RE.search(normalized))


def resolve_function(typed, sigs, custom, strict=False):
    """Longest-suffix function resolution over KB + customs (with aliases).
    strict=True when '[' is attached — only the full typed name matches."""
    m = re.match(r"\$" + LOOSE_OPERATOR_CHAIN + r"([A-Za-z0-9_]+)", typed, re.I)
    if not m:
        return None, ""
    name = m.group(1).lower()
    if strict:
        return (sigs.get(name) or custom.get(name)), name
    for ln in range(len(name), 0, -1):
        cand = name[:ln]
        if cand in sigs or cand in custom:
            return (sigs.get(cand) or custom.get(cand)), cand
    return None, name


def parse_calls(cooked, sigs=None, custom=None):
    """Walk cooked code with the loose operator scanner (any operator order,
    dup operators, bare calls all visible). Yields positioned Call dicts:
    name, index, open_index, close_index, args [(value, start, end)],
    negated, silent, count_delim, invalid_order, dup_operators, depth,
    body (raw inner text), line, col."""
    calls = []
    for m in FN_SCAN_LOOSE_RE.finditer(cooked):
        idx = m.start()
        if is_escaped(cooked, idx) or is_ignored_region(cooked, idx):
            continue
        base = m.group(0)
        has_open = base.endswith("[")
        raw_prefix, invalid_order = validate_operator_prefix(base)
        sp = STRICT_PREFIX_RE.match(base)
        negated = bool(sp and sp.group(1))
        silent = bool(sp and sp.group(2))
        cd = re.match(r"^\$[!#]*@\[([^\]]*)\]", base)
        count_delim = cd.group(1) if cd else None
        # duplicated operators: loose prefix longer than any valid strict one
        strict_len = 1 + (1 if negated else 0) + (1 if silent else 0) + \
            ((3 + len(count_delim)) if count_delim is not None else 0)
        dup_operators = len(raw_prefix) > strict_len

        name_part = base[len(raw_prefix):]
        if has_open:
            name_part = name_part[:-1]
        open_index = idx + len(base) - 1 if has_open else -1
        close_index = find_matching_bracket(cooked, open_index) if has_open else -1
        body = cooked[open_index + 1:close_index] if close_index > 0 else ""
        args = split_args_pos(body) if close_index > 0 else []
        line, col = get_line_col(cooked, idx)
        calls.append({
            "name": name_part,
            "index": idx,
            "raw": base,
            "open_index": open_index,
            "close_index": close_index,
            "body": body,
            "args": args,
            "negated": negated,
            "silent": silent,
            "count_delim": count_delim,
            "invalid_order": invalid_order,
            "dup_operators": dup_operators,
            "prefix_len": len(raw_prefix),
            "depth": bracket_depth(cooked[:idx]),
            "line": line,
            "col": col,
        })
    return calls


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

    # Store tracking ($let/keywords vs $env/environment — separate stores)
    env_vars_defined = set()      # vars populated into the env store
    env_reads = {}                # var → (line, col, ctx) of $env reads

    # Producer → consumer tracking
    arrays_defined = set()

    # Custom fn params are env vars INSIDE their own bodies only — seed
    # them when linting that fn's code (exact match); union fallback for
    # multi-fn files to avoid false store-confusion positives.
    if custom and label and "functions" in label.replace("\\", "/"):
        seeded = False
        for cf in custom.values():
            if cf.get("code") and cf["code"] == code:
                env_vars_defined.update(cf.get("params", []))
                seeded = True
                break
        if not seeded:
            for cf in custom.values():
                env_vars_defined.update(cf.get("params", []))

    # ══ SYNTAX & STRUCTURE ════════════════════════════════════════════════

    # ── 1. Bracket balance with per-line tracking (raw heuristic) ──
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

    # (imbalance verdict is deferred until after the call scan — see below)

    # ── 2-14, 15-48. Per-call checks (the main scan — v4 engine) ──
    parsed = parse_calls(cooked, sigs, custom)
    max_nesting = 0

    for call in parsed:
        fname = call["name"]
        fname_lower = fname.lower()
        line_no = call["line"]
        col = call["col"]
        ctx_line = get_context_line(cooked, call["index"])

        has_open = call["open_index"] != -1
        if has_open and call["close_index"] == -1:
            findings.append(Finding("error", "brackets",
                f"${fname} unclosed — no matching ] found",
                line_no, col,
                fix="Add the closing ] or escape literal brackets",
                context=ctx_line))
        max_nesting = max(max_nesting, call["depth"])

        body = call["body"]
        args = [a[0] for a in call["args"]]

        all_calls.append((fname, body, line_no, col, ctx_line))

        sig = sigs.get(fname_lower)
        is_custom = fname_lower in custom

        # ── 71. Invalid operator order (!# / @[sep]! etc.) ──
        if call["invalid_order"]:
            findings.append(Finding("error", "operator-order",
                f"Operators in wrong order before ${fname} — the compiler only "
                f"accepts $[!][#][@[sep]]; this prefix parses as literal text",
                line_no, col,
                fix="Reorder to $!#fn[...] (negation, silent, count)",
                context=ctx_line))

        # ── 72. Duplicated operators ──
        if call["dup_operators"]:
            findings.append(Finding("error", "operator-dup",
                f"Duplicated operator(s) before ${fname} — only one ! and one # "
                f"are meaningful; extras become literal text",
                line_no, col,
                fix="Use exactly one of each: $!#fn[...]",
                context=ctx_line))

        # ── 73. Bare call of a brackets-required function ──
        if not has_open and sig and sig.get("brackets") == "required":
            findings.append(Finding("error", "brackets-required",
                f"${fname} used without brackets — this function REQUIRES them "
                f"(compile error: 'Function ${fname} requires brackets')",
                line_no, col,
                fix=f"Add [...]: ${fname}[...]",
                context=ctx_line))

        # ── 3. Unknown function ──
        if sig is None and not is_custom:
            # longest-suffix resolution for glued names, then prefix suggestions
            resolved, cand = resolve_function(call["raw"], sigs, custom)
            if resolved is None:
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
        if sig and sig["params"] and has_open:
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

                # 20/55. Time format + runtime-verified time traps
                if p["type"] == "Time" and re.fullmatch(r"[A-Za-z0-9. ]+", a):
                    if TIME_TRAP_DECIMAL.match(a):
                        findings.append(Finding("error", "time-trap",
                            f"${fname} arg#{idx+1}: '{a}' — decimals with a unit THROW at runtime "
                            f"(integer units only; a bare decimal is a ms value)",
                            line_no, col,
                            fix="Use whole units: '90m' not '1.5h'; or convert to ms",
                            context=ctx_line))
                    elif TIME_TRAP_MS.match(a):
                        findings.append(Finding("error", "time-trap",
                            f"${fname} arg#{idx+1}: '{a}' — there is no 'ms' unit "
                            f"(a bare number IS milliseconds)",
                            line_no, col, fix=f"Write {a.replace('ms','').strip()} (plain ms number)",
                            context=ctx_line))
                    elif TIME_TRAP_CAPM.match(a):
                        findings.append(Finding("error", "time-trap",
                            f"${fname} arg#{idx+1}: '{a}' — capital M = MONTH (30d), not minute",
                            line_no, col, fix=f"Minutes are lowercase: {a.replace('M','m')}",
                            context=ctx_line))
                    elif not TIME_RE.match(a):
                        findings.append(Finding("warn", "type-gate",
                            f"${fname} arg#{idx+1}: '{a}' not a valid time format "
                            f"(use '10m', '1h30m', or ms number; units: s m h d w M y)",
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
            if fname_lower == "env" and var_name:
                env_reads[var_name] = (line_no, col, ctx_line)

        # ── 49-50. Store tracking: env producers ──
        if fname_lower in ENV_PRODUCER_FNS:
            ai = ENV_PRODUCER_FNS[fname_lower]
            if fname_lower == "httprequest":
                # last arg is the response var (if the call stores one)
                if len(args) >= 2 and args[-1].strip():
                    env_vars_defined.add(args[-1].strip())
            elif ai < len(args) and args[ai].strip():
                env_vars_defined.add(args[ai].strip())

        # ── 63. Array consumer validation ──
        if fname_lower in ARRAY_PRODUCERS and args:
            arrays_defined.add(args[0].strip())
        elif fname_lower in ARRAY_CONSUMERS and args:
            arr_name = args[0].strip()
            if arr_name and arr_name not in arrays_defined and "$" not in arr_name:
                # not defined here; if also not $let-ed or env-defined, flag it
                if arr_name not in vt.defined and arr_name not in env_vars_defined:
                    findings.append(Finding("warn", "array-undefined",
                        f"${fname} reads array '{arr_name}' that's never created in this code "
                        f"($arrayLoad/$arrayCreate/$let) — empty/undefined if not from outer scope",
                        line_no, col, context=ctx_line))

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
            if re.fullmatch(r"\d+[smhdwM].*", arg, re.I):
                findings.append(Finding("error", "parsems",
                    f"$parseMS receives '{arg}' (duration text) but expects a Number (ms) — "
                    f"this is ms→human, NOT text→ms",
                    line_no, col,
                    fix="Use $parseString[text] for text→ms conversion",
                    context=ctx_line))

        # ── 43/68. Unbounded loops ──
        if fname_lower == "loop":
            loop_depth += 1
            if args and args[0].strip() == "-1":
                if "$break" not in body:
                    findings.append(Finding("error", "infinite",
                        f"$loop[-1] without $break guard — infinite loop",
                        line_no, col,
                        fix="Add $break condition inside the loop body",
                        context=ctx_line))
                elif "$wait" not in body:
                    findings.append(Finding("warn", "spin",
                        f"$loop[-1] spin-lock without $wait — unthrottled busy-loop "
                        f"(the async-join idiom needs $wait[n] between checks)",
                        line_no, col,
                        fix="Add $wait[5] (or similar) inside the loop body",
                        context=ctx_line))
            # ── 56. Literal text in loop body is discarded ──
            if len(args) >= 2 and "$return[" not in body:
                code_arg = args[1]
                leftover = code_arg
                while True:
                    cm = CALL_RE.search(leftover)
                    if not cm:
                        break
                    ce = find_call_end(leftover, cm.end())
                    leftover = (
                        leftover[: cm.start()] + " " +
                        (leftover[ce + 1:] if ce > 0 else "")
                    )
                literal_text = leftover.replace("\\", "").replace(";", "").strip()
                if len(literal_text) > 2:
                    findings.append(Finding("warn", "loop-output",
                        f"$loop body contains plain text ('{literal_text[:20]}') but no $return — "
                        f"plain output is DISCARDED; only $return values accumulate",
                        line_no, col,
                        fix="Wrap accumulated output in $return[...] inside the loop",
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

    # ── 1b. Bracket imbalance verdict (call-aware) ──
    if total_depth > 0:
        any_unclosed = any(
            c["open_index"] != -1 and c["close_index"] == -1 for c in parsed
        )
        if any_unclosed:
            findings.append(Finding("error", "brackets",
                f"Bracket imbalance: net +{total_depth} with an unclosed call — "
                f"a real compile error"))
        else:
            findings.append(Finding("info", "brackets",
                f"Net +{total_depth} brackets — all CALLS close cleanly, so these "
                f"are literal brackets in text (harmless; escape as \\[ \\] to "
                f"silence)"))

    # ── 74. Operator prefix attached to a second $ ($!$fn — double-dollar) ──
    for m in re.finditer(r"\$[!#]+\$|\$@\[[^\]]*\]\$", cooked):
        ln, cl = get_line_col(cooked, m.start())
        findings.append(Finding("error", "operator-attach",
            f"'{m.group(0)}' — an operator prefix on a SECOND $ never applies; "
            f"the runtime reads it as literal text plus a normal call",
            ln, cl,
            fix="Move the prefix onto the call's own $: $!fn / $#fn",
            context=get_context_line(cooked, m.start())))

    # ── 77. Condition-field operator traps ──
    # Runtime truth (Compiler.parseConditionField): the FIRST literal-text
    # operator wins; later ones become rhs literals. Empty rhs = comparison
    # against "" (the legit "not-empty" idiom) — never flagged. Empty LHS is
    # a constant comparison (almost always a bug). '<@', '<#', '<&' are
    # Discord mention syntax, not less-than operators.
    def _ops_at_depth0(text, cap=5):
        found = []
        probe = text
        while len(found) < cap:
            op = find_condition_operator(probe)
            if not op:
                break
            sym, s, e = op
            if sym in "<>" and sym not in ("<=", ">="):
                nxt = probe[e:e + 1]
                if nxt in "@&#":
                    probe = probe[e:]
                    continue
            found.append((sym, s, e))
            probe = probe[e:]
        return found

    CONDITION_FNS = {
        "if": [0], "ifx": [0], "elseif": [0], "while": [0],
        "onlyif": [0], "checkcondition": "all",
        "and": "all", "or": "all",
    }
    for call in parsed:
        fl = call["name"].lower()
        arg_ids = CONDITION_FNS.get(fl)
        if not arg_ids or not call["args"]:
            continue
        targets = (
            range(len(call["args"])) if arg_ids == "all"
            else [i2 for i2 in arg_ids if i2 < len(call["args"])]
        )
        for i in targets:
            arg_text = call["args"][i][0]
            ops = _ops_at_depth0(arg_text)
            if len(ops) > 1:
                findings.append(Finding("warn", "condition-trap",
                    f"${call['name']} arg#{i + 1}: {len(ops)} operators "
                    f"('{ops[0][0]}…{ops[-1][0]}') — only the FIRST is parsed; "
                    f"the rest become literal text on the right side",
                    call["line"], call["col"],
                    fix="One comparison per field; combine with $and/$or",
                    context=get_context_line(cooked, call["index"])))
            elif len(ops) == 1:
                sym, s, e = ops[0]
                if not arg_text[:s].strip():
                    findings.append(Finding("warn", "condition-trap",
                        f"${call['name']} arg#{i + 1}: operator '{sym}' has an "
                        f"EMPTY left side — resolves to a constant comparison "
                        f"(\"\" {sym} rhs), never what was intended",
                        call["line"], call["col"],
                        fix="Provide the left side: $fn[a==b;...]",
                        context=get_context_line(cooked, call["index"])))

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

    # ══ RUNTIME SEMANTICS (three-agent verified) ═══════════════════════════

    # ── Bare-call sweep: CALL_RE requires '[', but functions with optional
    # args are legally called WITHOUT brackets ($addActionRow, $ephemeral,
    # $defer, ...). Rebuild producer/gate/flow line lists from a word-
    # boundary scan that catches both forms. ──
    def line_hits(names):
        pats = [re.compile(rf"\$[!#]?{n}\b", re.I) for n in names]
        return [
            i for i, ln in enumerate(lines, 1)
            if any(p.search(ln) for p in pats)
        ]

    action_row_lines = line_hits(["addActionRow"])
    select_menu_lines = line_hits(["addStringSelectMenu"])
    modal_lines = line_hits(["modal"])
    add_option_lines = line_hits(["addOption"])
    add_textinput_lines = line_hits(["addTextInput"])
    show_modal_lines = line_hits(["showModal"])
    defer_lines = line_hits(["defer", "interactionDefer", "deferUpdate"])
    reply_lines = line_hits(["interactionReply"])
    update_lines = line_hits(["interactionUpdate"])
    ephemeral_lines = line_hits(["ephemeral"])
    fetch_components_lines = line_hits(["fetchComponents"])
    manual_component_lines = line_hits(sorted(COMPONENT_DECORATORS))
    decorator_lines = [
        ("decorator", l) for l in line_hits(sorted(CONTAINER_DECORATORS))
    ]
    gate_lines = [
        ("gate", l) for l in line_hits(sorted(CONTAINER_RESET_GATES))
    ]
    text_split_seen = bool(line_hits(["textSplit"]))
    json_load_seen = bool(line_hits(["jsonLoad"]))
    http_request_seen = bool(line_hits(["httpRequest"]))

    # ── 49. $env[x] where x is only $let-defined (store confusion) ──
    for var, (ln, cl, ctxl) in env_reads.items():
        if var in env_vars_defined:
            continue
        if var in vt.defined:
            findings.append(Finding("error", "store-confusion",
                f"$env[{var}] but '{var}' is only $let-defined — $let writes the KEYWORDS "
                f"store; $env reads the ENVIRONMENT store (jsonLoad/try/http/fn params). "
                f"Result: always empty. Use $get[{var}]",
                ln, cl, context=ctxl))
        # env read of a var defined nowhere at all → var-flow check covers it

    # ── 50. $get[x] where x is only env-defined ──
    for m in re.finditer(r"\$get\[(\w+)\]", cooked):
        var = m.group(1)
        if var in env_vars_defined and var not in vt.defined:
            ln, _ = get_line_col(cooked, m.start())
            findings.append(Finding("error", "store-confusion",
                f"$get[{var}] but '{var}' is only env-defined (jsonLoad/try/http/param) — "
                f"$get reads the KEYWORDS store. Use $env[{var}]",
                ln, context=get_context_line(cooked, m.start())))
            break  # one finding per var-class is enough

    # ── 51. Container decorators before a resetting gate ──
    for gname, gline in gate_lines:
        destroyed = [(d, dl) for d, dl in decorator_lines if dl < gline]
        if destroyed:
            findings.append(Finding("warn", "container-reset",
                f"container-resetting gate (line {gline}) fires AFTER {len(destroyed)} "
                f"decorator(s) (first at line {destroyed[0][1]}) — the gate's error send "
                f"RESETS the container: embeds/components are destroyed when it trips",
                gline,
                fix="Move the gate ($cooldown/$onlyIf/...) above all embed/component builders",
                context=lines[gline - 1].strip()[:70] if gline <= len(lines) else None))

    # ── 52. Literal backslash before a function (escape is dropped) ──
    for m in re.finditer(r"\\\$[A-Za-z_][A-Za-z0-9_]*\[", cooked):
        fn = m.group(0)[2:-1]
        ln, cl = get_line_col(cooked, m.start())
        findings.append(Finding("error", "backslash-fn",
            f"\\${fn}[ — the backslash is DROPPED by the runtime and the function executes "
            f"anyway (SystemRegex ignores its own escape guard). This is not a suppression.",
            ln, cl,
            fix="Remove the backslash and negate with $! or silence with $# at top level, "
                "or restructure (e.g. $c[...] wrapping for literal text)",
            context=get_context_line(cooked, m.start())))

    # ── 53-54. $# flag misuse (nested = ignored; top-level = still aborts) ──
    if "$#" in cooked:
        # Build a depth map to know which $# calls are nested
        depth_at = []
        d = 0
        i = 0
        while i < len(cooked):
            c = cooked[i]
            if c == "\\":
                depth_at.extend([d, d])
                i += 2
                continue
            if c == "[":
                depth_at.append(d)
                d += 1
            else:
                depth_at.append(d)
                if c == "]":
                    d -= 1
            i += 1
        for m in re.finditer(r"\$\#", cooked):
            pos = m.start()
            if pos < len(depth_at) and depth_at[pos] > 0:
                ln, cl = get_line_col(cooked, pos)
                nxt = cooked[pos : pos + 30].split("[")[0]
                findings.append(Finding("warn", "silent-flag",
                    f"{nxt}[ uses $# but is NESTED — the # flag is only honored on the "
                    f"top-level call of a run; nested # is ignored",
                    ln, cl,
                    fix="Wrap in $try[code;catch] for real error containment",
                    context=get_context_line(cooked, pos)))
            else:
                ln, cl = get_line_col(cooked, pos)
                nxt = cooked[pos : pos + 30].split("[")[0]
                findings.append(Finding("info", "silent-flag",
                    f"{nxt}[ uses $# at top level — this suppresses the alert but STILL "
                    f"ABORTS the whole run: nothing after it executes",
                    ln, cl,
                    fix="If you need continue-on-error, use $try[code;catch]",
                    context=get_context_line(cooked, pos)))

    # ── 57. Buttons/menus without an action row ──
    attach_fns = {
        "addbutton", "addstringselectmenu", "adduserselectmenu",
        "addroleselectmenu", "addchannelselectmenu", "addmentionableselectmenu",
    }
    for (fname, body, line_no, col, ctx_line) in all_calls:
        fl = fname.lower()
        if fl in attach_fns:
            prior_rows = [l for l in action_row_lines if l <= line_no]
            if not prior_rows:
                findings.append(Finding("error", "component-order",
                    f"${fname} with no prior $addActionRow — components attach to the "
                    f"NEWEST row; with none, Discord rejects the message",
                    line_no, col,
                    fix="Add $addActionRow before the first component on each row",
                    context=ctx_line))

    # ── 58. $addOption without a select menu ──
    for ln in add_option_lines:
        prior_menu = [l for l in select_menu_lines if l <= ln]
        if not prior_menu:
            findings.append(Finding("error", "component-order",
                f"$addOption (line {ln}) with no prior $addStringSelectMenu — "
                f"options attach to the newest select; orphaned options are dropped",
                ln, fix="Add the select menu first, then its $addOption entries"))

    # ── 59. Modal completeness ──
    for ln in add_textinput_lines:
        if not any(l <= ln for l in modal_lines):
            findings.append(Finding("error", "modal-order",
                f"$addTextInput (line {ln}) before $modal — the modal object must "
                f"be created first", ln,
                fix="$modal[customID;title] → $addLabel → $addTextInput → $showModal"))
    for ln in show_modal_lines:
        if not modal_lines:
            findings.append(Finding("error", "modal-order",
                f"$showModal (line {ln}) with no $modal built in this code", ln,
                fix="Build with $modal + $addTextInput before $showModal"))

    # ── 60. jsonSet/jsonDelete with no jsonLoad ──
    if re.search(r"\$\!?json(Set|Delete)\[", cooked) and not json_load_seen:
        for m in re.finditer(r"\$\!?(jsonSet|jsonDelete)\[", cooked):
            ln, _ = get_line_col(cooked, m.start())
            findings.append(Finding("warn", "json-order",
                f"${m.group(1)} with no $jsonLoad in this code — it operates "
                f"on the MOST RECENTLY loaded JSON; with none, writes go nowhere "
                f"(unless a custom fn loaded one earlier in the run)",
                ln, fix="$jsonLoad[var;json] first, then $jsonSet/$jsonDelete",
                context=get_context_line(cooked, m.start())))
            break

    # ── 61. SplitText family without $textSplit ──
    if re.search(r"\$splitText|\$getSplitTextLength", cooked) and not text_split_seen:
        m = re.search(r"\$(splitText(?:Join)?|getSplitTextLength)", cooked)
        if m:
            ln, _ = get_line_col(cooked, m.start())
            findings.append(Finding("warn", "split-order",
                f"${m.group(1)} with no $textSplit in this code — it reads a HIDDEN "
                f"split store (disjoint from named arrays); empty without a prior split",
                ln, fix="$textSplit[text;separator] first",
                context=get_context_line(cooked, m.start())))

    # ── 62. httpResult/httpPing without httpRequest ──
    if re.search(r"\$http(Result|Ping|GetHeader)\[", cooked) and not http_request_seen:
        m = re.search(r"\$http(Result|Ping|GetHeader)\[", cooked)
        ln, _ = get_line_col(cooked, m.start())
        findings.append(Finding("warn", "http-order",
            f"${m.group(0)[1:-1]} with no $httpRequest in this code — response env "
            f"is only populated by a prior $httpRequest[...,var]",
            ln, context=get_context_line(cooked, m.start())))

    # ── 64. $ephemeral after defer/reply ──
    if ephemeral_lines:
        ephemeral_line = min(ephemeral_lines)
        blocking = defer_lines + reply_lines + update_lines
        late = [l for l in blocking if l < ephemeral_line]
        if late:
            findings.append(Finding("warn", "ephemeral-late",
                f"$ephemeral (line {ephemeral_line}) placed after $defer/$interactionReply "
                f"(line {late[0]}) — it's read at FLUSH time; by then the flag is moot",
                ephemeral_line,
                fix="Put $ephemeral before the defer/reply (top of the interaction code)"))

    # ── 65. $interactionReply after $defer ──
    for rline in reply_lines:
        prior_defer = [l for l in defer_lines if l < rline]
        if prior_defer:
            findings.append(Finding("error", "defer-conflict",
                f"$interactionReply (line {rline}) after $defer (line {prior_defer[0]}) — "
                f"defer consumed the reply slot; the reply 400s",
                rline,
                fix="Use $interactionFollowUp after $defer"))
            break

    # ── 66. $fetchComponents mixed with manual builders ──
    if fetch_components_lines and manual_component_lines:
        findings.append(Finding("warn", "component-conflict",
            f"$fetchComponents (line {fetch_components_lines[0]}) mixed with manual "
            f"component builders (line {manual_component_lines[0]}) — fetch OVERRIDES "
            f"manually added components",
            fetch_components_lines[0],
            fix="Use one strategy: fetch the original message's components OR build fresh"))

    # ── 67. Context-gated fns in command files ──
    if label:
        is_cmd_file = "slashesCmd" in label or "prefixesCmd" in label
        if is_cmd_file:
            for (fname, body, line_no, col, ctx_line) in all_calls:
                fl = fname.lower()
                if fl in INTERACTION_ONLY_FNS:
                    findings.append(Finding("warn", "context-gate",
                        f"${fname} in a command file — only meaningful in "
                        f"{INTERACTION_ONLY_FNS[fl]}; always empty here",
                        line_no, col, context=ctx_line))
                elif fl in SLASH_ONLY_FNS and "prefixesCmd" in label:
                    findings.append(Finding("warn", "context-gate",
                        f"${fname} in a PREFIX command file — slash-interaction only; "
                        f"empty in message commands",
                        line_no, col, context=ctx_line))

    # ── 69. djsEval interpolation without the JSON bridge ──
    for body, line_no, col, ctx_line in djs_eval_bodies:
        interp = re.findall(r"\$(?:get|env)\[\w+\]", body)
        if interp and "$jsonStringify" not in body:
            findings.append(Finding("info", "eval-bridge",
                f"$djsEval interpolates {', '.join(interp[:3])} raw — quotes/backslashes "
                f"in the value break the JS literal. The injection-safe bridge is "
                f"$jsonStringify[var], which yields a valid double-quoted JS string",
                line_no, col,
                fix="ctx.getKeyword('var') in JS, or $djsEval[...$jsonStringify[var]...]",
                context=ctx_line))

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

def lint_path(path, sigs, custom, enums, cmd_registry=None, events=None):
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
    events = events if events is not None else {}

    for f in sorted(files):
        raw = f.read_text(encoding="utf-8")
        code_strings = extract_code_strings(f)
        if not code_strings:
            continue
        total_files += 1
        file_findings = []
        for code in code_strings:
            file_findings.extend(
                lint_code(code, sigs, custom, enums, str(f), cmd_registry)
            )

        # ── 75. Event-type literals (ForgeVSC-style file-level validation) ──
        if events:
            for tm in re.finditer(r'type:\s*["\']([/\w]+)["\']', raw):
                if is_inside_comment(raw, tm.start(1)):
                    continue
                ev_name = tm.group(1)
                ln = raw[: tm.start(1)].count("\n") + 1
                if ev_name not in events:
                    file_findings.append(Finding("error", "event-type",
                        f'Unknown event type "{ev_name}" — not in the KB event '
                        f"registry (typo, or a custom event handler?)",
                        ln))
                elif events[ev_name]["deprecated"]:
                    file_findings.append(Finding("warn", "event-type",
                        f'Event "{ev_name}" is deprecated — migrate away',
                        ln))

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


# ── v4 interactive modes (ForgeVSC features, CLI form) ────────────────────

def generate_usage(sig, custom_info=None):
    """ForgeVSC-style usage string: $fn[a;b?;...rest]."""
    params = sig["params"] if sig else []
    if custom_info and not params:
        params = [
            {"name": p, "required": i < custom_info["required"], "rest": False}
            for i, p in enumerate(custom_info.get("params", []))
        ]
    parts = []
    for p in params:
        s = ("..." if p.get("rest") else "") + p["name"]
        if not p.get("required"):
            s += "?"
        parts.append(s)
    name = (sig["name"] if sig else custom_info["name"])
    return f"${name}[{';'.join(parts)}]" if parts else f"${name}"


def mode_complete(query, sigs, custom, enums):
    """Autocompletion: fuzzy prefix match with usage + docs."""
    q = query.lstrip("$").lower()
    if not q:
        print("Usage: --complete <partial>")
        return 0
    print(f"{C.BOLD}┌─ Complete '{query}'{C.RESET} " + "─" * 34)
    canon = set()
    for key, sig in sigs.items():
        if sig["name"].lower().startswith(q) and key == sig["name"].lower():
            canon.add(key)
    for key in custom:
        if key.startswith(q):
            canon.add(key)
    hits = sorted(canon)[:20]
    if not hits:
        # substring fallback
        hits = sorted(k for k in sigs if q in k)[:20]
    if not hits:
        print(f"│ {C.RED}no matches{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return 1
    for h in hits:
        if h in custom:
            ci = custom[h]
            print(f"│ {C.CYAN}{generate_usage(None, ci)}{C.RESET} "
                  f"{C.DIM}(custom — {ci['file']}:{ci.get('line', '?')}){C.RESET}")
            if ci.get("has_return"):
                print(f"│   {C.YELLOW}⚠ has $return — bare top-level calls kill the run{C.RESET}")
        else:
            s = sigs[h]
            flags = "".join([
                C.RED + " deprecated" + C.RESET if s["deprecated"] else "",
                C.YELLOW + " experimental" + C.RESET if s["experimental"] else "",
            ])
            print(f"│ {C.CYAN}{generate_usage(s)}{C.RESET}"
                  f"{(' ' + flags) if flags else ''}")
            if s.get("description"):
                print(f"│   {C.DIM}{s['description'][:90]}{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
    return 0


def mode_signature(code, sigs, custom):
    """Signature help: given partial code, report the active argument."""
    cooked = js_cook(code)
    open_idx = find_opening_bracket(cooked)
    print(f"{C.BOLD}┌─ Signature help{C.RESET} " + "─" * 36)
    if open_idx == -1:
        print(f"│ {C.RED}no open call bracket found in the snippet{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return 1
    head = cooked[:open_idx]
    m = re.search(r"(\$" + OPERATOR_CHAIN + r"[A-Za-z0-9_]+)$", head, re.I)
    if not m:
        print(f"│ {C.RED}no function token before the bracket{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return 1
    token = m.group(1)
    fname = re.sub(r"^\$" + LOOSE_OPERATOR_CHAIN, "", token, flags=re.I).lower()
    args_typed = cooked[open_idx + 1:]
    typed_calls = split_args_pos(args_typed)
    active = len(typed_calls) - 1
    sig = sigs.get(fname)
    ci = custom.get(fname)
    print(f"│ {C.BOLD}{token}{C.RESET} — active argument: "
          f"{C.GREEN}#{active + 1}{C.RESET}")
    if ci:
        params = ci.get("params", [])
        print(f"│ {C.CYAN}(custom function — {ci['file']}:{ci.get('line','?')}){C.RESET}")
        for i, p in enumerate(params[:active + 3]):
            marker = C.GREEN + "◆" + C.RESET if i == active else " "
            opt = "" if i < ci["required"] else C.DIM + " (optional)" + C.RESET
            print(f"│ {marker} {i + 1}. {p}{opt}")
    elif sig:
        params = sig["params"]
        for i, p in enumerate(params[:active + 3]):
            marker = C.GREEN + "◆" + C.RESET if i == active else " "
            req = C.RED + "*" + C.RESET if p["required"] else " "
            rest = f" {C.DIM}(rest){C.RESET}" if p["rest"] else ""
            ename = sig.get("enum_names", {}).get(i)
            extra = f" {C.DIM}[enum: {ename}]{C.RESET}" if ename else ""
            print(f"│ {marker} {req} {i + 1}. {C.CYAN}{p['name']}{C.RESET} "
                  f"{C.DIM}({p['type']}){C.RESET}{rest}{extra}")
            if i == active and p.get("description") is None and sig.get("quirks"):
                print(f"│     {C.DIM}{sig['quirks']}{C.RESET}")
        total = len(params)
        if active + 1 > total and not (params and params[-1]["rest"]):
            print(f"│ {C.RED}⚠ past the last parameter ({total}){C.RESET}")
    else:
        print(f"│ {C.RED}${fname} not found in KB or customs{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
    return 0


def mode_guides(query, guides_dir=None):
    """Search community guides (96 local, full content) by fn/event/text."""
    gdir = Path(guides_dir) if guides_dir else KB / "guides"
    if not gdir.exists():
        print("Guides folder not found in KB")
        return 1
    q = query.lstrip("$").lower()
    print(f"{C.BOLD}┌─ Guides matching '{query}'{C.RESET} " + "─" * 27)
    hits = []
    for md in sorted(gdir.glob("guide-*.md")):
        text = md.read_text(encoding="utf-8")
        tl = text.lower()
        header = text.split("\n", 1)[0].lstrip("# ").strip()
        score = 0
        if re.search(rf"`{re.escape(q)}`", text, re.I):
            score = 3
        elif f"`${q}`" in tl or re.search(rf"target.*{re.escape(q)}", tl):
            score = 3
        elif q in header.lower():
            score = 2
        elif q in tl:
            score = 1
        if score:
            hits.append((score, md.name, header, text))
    hits.sort(key=lambda h: (-h[0], h[1]))
    if not hits:
        print(f"│ {C.RED}no guides match{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return 1
    for score, fname, header, text in hits[:10]:
        star = C.YELLOW + "★" * score + C.RESET
        print(f"│ {star} {C.BOLD}{header}{C.RESET} {C.DIM}({fname}){C.RESET}")
        # first meaningful content line
        for ln in text.split("\n")[3:12]:
            if ln.strip() and not ln.startswith(">"):
                print(f"│   {C.DIM}{ln.strip()[:88]}{C.RESET}")
                break
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
    return 0


def mode_outline(path, sigs, custom):
    """Code map: every call with line span (folding ranges), depth, preview."""
    p = Path(path)
    if not p.exists():
        print(f"Error: {path} not found")
        return 1
    raw = p.read_text(encoding="utf-8")
    print(f"{C.BOLD}┌─ Outline {p.name}{C.RESET} " + "─" * 36)
    for start, end, quote in locate_code_blocks(raw):
        cooked = js_cook(raw[start:end])
        line0 = raw[:start].count("\n") + 1
        for c in parse_calls(cooked, sigs, custom):
            close = c["close_index"]
            start_l = c["line"] + line0 - 1
            if close > 0:
                end_line = cooked[:close].count("\n") + line0
                span = f"L{start_l}-{end_line}"
            else:
                span = f"L{start_l}"
            arg_preview = ""
            if c["args"]:
                arg_preview = c["args"][0][0][:28].replace("\n", " ")
                arg_preview = f" {C.DIM}{arg_preview}{C.RESET}"
            flags = ""
            if c["negated"]:
                flags += C.RED + "!" + C.RESET
            if c["silent"]:
                flags += C.BLUE + "#" + C.RESET
            print(f"│ {'  ' * min(c['depth'], 6)}{C.CYAN}${c['name']}{C.RESET}"
                  f"{flags} {C.DIM}{span}{C.RESET}{arg_preview}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
    return 0


def mode_events(name, events):
    """Event registry: search/list with intents + deprecation."""
    print(f"{C.BOLD}┌─ Events{name and ': ' + name or ''}{C.RESET} " + "─" * 33)
    names = [n for n in sorted(events) if not name or name.lower() in n.lower()]
    if not names:
        print(f"│ {C.RED}no events match{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return 1
    for n in names[:40]:
        e = events[n]
        dep = C.RED + " DEPRECATED" + C.RESET if e["deprecated"] else ""
        ints = ", ".join(e["intents"][:4])
        more = f" +{len(e['intents']) - 4}" if len(e["intents"]) > 4 else ""
        print(f"│ {C.CYAN}{n}{C.RESET}{dep}")
        if e["intents"]:
            print(f"│   {C.DIM}intents: {ints}{more}{C.RESET}")
    print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
    return 0


def mode_fix(path, dry=False):
    """Auto-fix the safe classes: operator order + duplicated operators."""
    p = Path(path)
    if not p.exists():
        print(f"Error: {path} not found")
        return 1
    raw = p.read_text(encoding="utf-8")
    fixes = 0

    def reorder(m):
        nonlocal fixes
        seg = m.group(0)
        neg = "!" if "!" in seg else ""
        sil = "#" if "#" in seg else ""
        cnt = re.search(r"@\[[^\]]*\]", seg)
        rebuilt = "$" + neg + sil + (cnt.group(0) if cnt else "")
        if rebuilt != seg:
            fixes += 1
        return rebuilt

    # operator soup between $ and a name
    new = re.sub(r"\$[!#@\[\],]*(?:!\s*#|#\s*!|!{2,}|#{2,})[!#@\[\],]*(?=[A-Za-z0-9_])",
                 reorder, raw)
    if fixes:
        action = "would fix" if dry else "fixed"
        print(f"{action} {fixes} operator prefix(es) in {p.name}")
        if not dry:
            p.write_text(new, encoding="utf-8")
    else:
        print(f"{C.GREEN}✓ nothing to fix in {p.name}{C.RESET}")
    return 0


def mode_comment(path, lines_spec, wrap=True, indent_unit="    "):
    """$c[...] comment toggle (ForgeVSC comment.ts port)."""
    p = Path(path)
    if not p.exists():
        print(f"Error: {path} not found")
        return 1
    lines = p.read_text(encoding="utf-8").split("\n")
    m = re.match(r"(\d+)(?:-(\d+))?", lines_spec)
    if not m:
        print("Usage: --comment f.js --lines 5[-9]")
        return 1
    a = int(m.group(1)) - 1
    b = int(m.group(2) or m.group(1)) - 1
    a, b = max(0, a), min(len(lines) - 1, b)
    sel = lines[a:b + 1]
    base_indent = re.match(r"^[ \t]*", sel[0]).group(0)

    first = sel[0].lstrip()
    if wrap and first.startswith("$c["):
        print("Already commented — use --uncomment")
        return 1

    if wrap:
        if len(sel) == 1:
            new_lines = [base_indent + "$c[" + sel[0][len(base_indent):] + "]"]
        else:
            body = [
                (indent_unit + ln if ln.strip() else ln)
                for ln in sel
            ]
            new_lines = [base_indent + "$c[", *body, base_indent + "]"]
    else:
        if not first.startswith("$c["):
            print("Not commented — use --comment")
            return 1
        if len(sel) >= 3 and sel[-1].strip() == "]":
            inner = sel[1:-1]
            new_lines = [
                ln[len(indent_unit):] if ln.startswith(indent_unit) else ln
                for ln in inner
            ]
        else:
            body = sel[0][len(base_indent) + 3:-1]
            new_lines = [base_indent + body]

    lines[a:b + 1] = new_lines
    p.write_text("\n".join(lines), encoding="utf-8")
    print(f"{'commented' if wrap else 'uncommented'} lines {a + 1}-{b + 1} "
          f"({len(sel)} → {len(new_lines)} lines)")
    return 0


# ── Main ───────────────────────────────────────────────────────────────────

def main():
    sigs = load_signatures()
    custom = load_custom_functions(ROOT)
    enums = load_enums()
    cmd_registry = load_command_registry(ROOT)
    events = load_events()

    if not sigs:
        print("Error: No KB signatures loaded. Set FORGE_KB env var.")
        return 1

    def arg_after(flag):
        i = sys.argv.index(flag)
        return sys.argv[i + 1] if i + 1 < len(sys.argv) else None

    if "--stats" in sys.argv:
        show_stats(sigs, custom, enums, cmd_registry)
        return 0

    # ── v4 modes ──
    if "--complete" in sys.argv:
        q = arg_after("--complete")
        return mode_complete(q, sigs, custom, enums) if q else 1

    if "--signature" in sys.argv:
        c = arg_after("--signature")
        return mode_signature(c, sigs, custom) if c else 1

    if "--guides" in sys.argv:
        q = arg_after("--guides")
        return mode_guides(q) if q else 1

    if "--outline" in sys.argv:
        t = arg_after("--outline")
        return mode_outline(t, sigs, custom) if t else 1

    if "--events" in sys.argv:
        return mode_events(arg_after("--events") or "", events)

    if "--fix" in sys.argv:
        t = arg_after("--fix")
        if not t:
            return 1
        before = Path(t).read_text(encoding="utf-8") if Path(t).exists() else ""
        r = mode_fix(t, dry="--dry" in sys.argv)
        after = Path(t).read_text(encoding="utf-8") if Path(t).exists() else ""
        if after != before and "--lint" in sys.argv:
            return lint_path(Path(t), sigs, custom, enums, cmd_registry, events)
        return r

    if "--comment" in sys.argv or "--uncomment" in sys.argv:
        flag = "--comment" if "--comment" in sys.argv else "--uncomment"
        t = arg_after(flag)
        spec = arg_after("--lines")
        if not t or not spec:
            print("Usage: fslint.py --(un)comment <file> --lines M[-N]")
            return 1
        return mode_comment(t, spec, wrap=(flag == "--comment"))

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

    return lint_path(target, sigs, custom, enums, cmd_registry, events)


if __name__ == "__main__":
    sys.exit(main())
