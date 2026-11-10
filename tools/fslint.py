#!/usr/bin/env python3
r"""fslint: ForgeScript static analyzer, parser and local runner. v5

v5 replaces the old regex/bracket-counting engine with fsparse.py, a Python
reimplementation of ForgeScript's own compiler that produces exactly the same
tree, fields, condition operators, output text and compile errors (message, line,
column) as ForgeScript 2.8.0. tools/test_fsparse.py proves that against the real
compiler (100% identical on bot code, every KB snippet and 65k fuzzed inputs).

What that changes for linting:
  * a call ends where ForgeScript ends it: brackets inside arguments are NOT
    counted, so `$let[x;a [r] b]` is reported as the bug it is
  * names match like the compiler: no word boundary, longest name first, so
    `$pingms` is `$ping` + "ms" and `$getChannelCooldownTime` without ForgeDB is
    `$get` + text (a compile error)
  * escapes, condition operators and the output renderer behave exactly as at runtime
  * only the packages the bot loads are known (package.json), plus its custom functions
  * JS strings are cooked exactly like JavaScript (tools/fsextract.py), with real
    file line numbers; `--snippet` takes ForgeScript text as-is (no JS cooking)

Every rule states its premise and how it was checked ([compiler], [runtime],
[source], [heuristic]) in tools/fslint_engine.py. tools/test_fslint.py runs each
rule's example on the real interpreter, so a rule can't contradict the runtime.

Usage:
  python3 tools/fslint.py                       # lint the repo
  python3 tools/fslint.py <file_or_dir>         # lint specific target
  python3 tools/fslint.py --snippet '$if[...'   # lint ForgeScript text (as ForgeScript receives it)
  python3 tools/fslint.py --js-snippet '...'    # lint text as written inside a JS template literal
  python3 tools/fslint.py --parse '$code'       # exact compiler tree, output text, errors
  python3 tools/fslint.py --sim '$code'         # execution order (eager vs lazy fields)
  python3 tools/fslint.py --run '$code'         # run on the real interpreter, offline (needs Node +
                                                #   @tryforge/forgescript; FS_MODULE to point at it)
  python3 tools/fslint.py --self-test           # extractor/loader vs Node, rule tests, parser diff
  python3 tools/fslint.py --packages ForgeScript,ForgeDB   # override detected packages
  python3 tools/fslint.py --deps | --stats | --diff | --events [name]
  python3 tools/fslint.py --explain '$fn' | --complete addbut | --signature '$if[a;'
  python3 tools/fslint.py --guides '$addButton' | --outline file.js
  python3 tools/fslint.py --fix file.js [--dry] | --(un)comment f.js --lines M[-N]

Function metadata: tools/fs_metadata.json (rebuild: tools/build_fs_metadata.py).
The BotForge knowledge base (FORGE_KB) is only needed for --guides.

RULES (severity / id / premise):
  error  compile                 the 3 compile errors, exact ForgeScript message + position [compiler]
  warn   unknown-function        $name not in the loaded packages: printed as text [compiler]
  warn   glued-name              $pingms = $ping + "ms" (info for the harmless ping+ms case) [compiler]
  warn   bare-variable           $total where total is a $let variable: printed as text [compiler]
  warn   operator-order          $#!fn / $!!fn: not a prefix, the call is printed as text [compiler]
  warn   operator-detached       $!$fn: operators apply to nothing [compiler]
  warn   ignored-brackets        $ping[x]: argless function, brackets printed as text [compiler]
  warn   bracket-in-arg          unescaped [ in an argument: the next ] closes the call [compiler]
  info   escape                  \n inside an argument is the letter n [compiler]
  warn   backslash-before-call   a literal \ right before a call is dropped from the output [compiler]
  info   tail-escape             escapes after the last call are printed as-is [compiler]
  warn   condition               no operator / second operator / && || / empty left side [compiler]
  error  missing-arg             required argument absent (empty-but-present is not missing) [source]
  error  type-gate               Boolean, Number, Time, Enum, URL, IDs, Permission literals [source+runtime]
  warn   color-number            123456 is decimal not hex; 4E5058 is Infinity (crash) [runtime]
  error  custom-arity            custom function called with too few arguments [source]
  warn   deprecated / info experimental   flags from ForgeScript's source [source]
  warn   store-confusion         $env of a $let variable / $get of an env variable [source+runtime]
  warn   json-precision          $jsonSet bare number > 2^53 [runtime]
  info   json-path               $jsonSet[var;a;b;v]: intermediate keys must already exist [runtime]
  warn   array-includes          digit needle vs $arrayLoad strings: always false [runtime]
  warn   phantom-element         $arrayLoad with no values makes [""] [runtime]
  error  parsems                 $parseMS takes milliseconds [runtime]
  warn   loop-output             text in a $loop body is discarded [runtime]
  error  infinite-loop / warn spin-loop   $loop[-1] without $break / without $wait [heuristic]
  info   silent-flag             $# hides the alert only; nested $# ignored [runtime+source]
  warn   gate-sends-container    $cooldown/$onlyIf send what was built before them [source]
  warn   component-order         button/menu before $addActionRow, $addOption without menu [source]
  warn   split-order             $splitText without $textSplit [runtime]
  warn   ephemeral-late          $ephemeral after $defer/$interactionReply [KB runtime]
  warn   dup-cooldown, info author-lock, error/warn security, info nesting   [heuristic]
  info   mention-ping            output pings via <@...> with no $disable*Mentions ($nomention only stops the reply ping) [heuristic]
  error/warn event-type          unknown or deprecated event in type: "..." (file level)

Removed in v5 because the premise was wrong (checked against 2.8.0):
  "$jsonSet operates on the last $jsonLoad-ed JSON" (the first key is the variable),
  "$interactionReply after $defer fails" (it edits the deferred reply),
  "a custom function's $return kills the command" (the caller keeps running),
  "\n in text is a literal backslash-n"
  (inside arguments it is the letter n), literal brackets "never break calls" (they do),
  alias chains (aliases always point at one function).
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

def _metadata():
    import fsparse
    return json.loads(fsparse.METADATA.read_text(encoding="utf-8"))


PACKAGES = None  # set by main(): the packages the linted bot loads


def load_signatures():
    """Every function and alias of the loaded packages, from tools/fs_metadata.json.
    Keys are lowercase names without '$'; aliases point at their function (alias_of)."""
    import fsparse
    meta = _metadata()
    reg = fsparse.Registry.load(PACKAGES)   # same precedence as ForgeClient (extensions, then core)
    winners = {f.name: f.package for f in reg.functions}
    sigs = {}
    for f in meta["functions"]:
        if winners.get(f["name"]) != f["package"]:
            continue  # not loaded, or overridden by an earlier registration
        base = f["name"].lstrip("$")
        if base.lower() in sigs:
            continue
        b = f.get("brackets")
        entry = {
            "name": base,
            "params": [{"name": a.get("name"), "type": a.get("type"), "required": a.get("required"),
                        "rest": a.get("rest")} for a in f.get("args") or []],
            "enum_names": {i: a["enum"] for i, a in enumerate(f.get("args") or []) if a.get("enum")},
            "alias_of": None,
            "experimental": f.get("experimental"),
            "deprecated": f.get("deprecated"),
            "category": f.get("category"),
            "package": f.get("package"),
            "file": f"https://docs.botforge.org/function/{f['name']}" + (f"?p={f.get('package')}" if f.get('package') != "ForgeScript" else ""),
            "description": f.get("description") or "",
            "quirks": "",
            "output": (f.get("output") or [None])[0] if isinstance(f.get("output"), list) else f.get("output"),
            "brackets": "required" if b is True else "optional" if b is False else "none",
            "unwrap": f.get("unwrap"),
        }
        sigs[base.lower()] = entry
        for a in f.get("aliases") or []:
            al = a.lstrip("$").lower()
            sigs.setdefault(al, {**entry, "name": a.lstrip("$"), "alias_of": base})
    return sigs


def load_enums():
    enums = {}
    for name, vals in _metadata().get("enums", {}).items():
        enums[name] = set(vals)
        enums[name.lower()] = set(vals)
    return enums


def load_custom_functions(root):
    """Custom functions (functions/ folder) in the shape the --deps/--explain/--complete modes use."""
    import fslint_engine
    custom = {}
    for d in fslint_engine.load_custom_functions(root):
        params = d["params"]
        names = [p if isinstance(p, str) else p["name"] for p in params]
        required = sum(1 for p in params if isinstance(p, str) or p.get("required", True))
        code = d.get("code") or ""
        custom[d["name"].lower()] = {
            "name": d["name"],
            "required": required,
            "max": len(names),
            "file": str(Path(d["file"]).relative_to(root)) if Path(d["file"]).is_relative_to(root) else d["file"],
            "line": d["line"],
            "code": code,
            "has_return": "$return[" in code,
            "params": names,
            "param_rest": [False if isinstance(p, str) else bool(p.get("rest")) for p in params],
            "first_param_condition": d["firstParamCondition"],
            "brackets": d["brackets"],
            "raw_params": params,
            "called": {m.group(1).lower() for m in re.finditer(r"\$[!#]?(\w+)", code)},
            "code_source": d.get("code_source"),
        }
    return custom


def load_events():
    """Event names per package, from tools/fs_metadata.json (all core events for ForgeScript)."""
    events = {}
    meta = _metadata()
    for pkg, names in meta.get("events", {}).items():
        if PACKAGES and pkg not in PACKAGES:
            continue
        for n in names:
            events[n] = {"intents": [], "deprecated": False, "since": None, "package": pkg, "file": pkg}
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


# ── Shared helpers ─────────────────────────────────────────────────────────

def js_cook(code):
    """The value JavaScript gives a template literal with this body (exact; see fsextract.py)."""
    import fsextract
    return fsextract.cook("`" + code + "`", 0, "`")[0]


CALL_RE = re.compile(r"\$[!#]?(?:@\[[^\]]*\])?([A-Za-z_][A-Za-z0-9_]*)\[")


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


def is_inside_comment(text, index):
    """JS-comment awareness (line + block) — operates on RAW file text."""
    line_start = text.rfind("\n", 0, index) + 1
    if "//" in text[line_start:index]:
        return True
    before = text[:index]
    return before.rfind("/*") > before.rfind("*/")


# ── Lint (rules live in fslint_engine.py) ───────────────────────────────────

def _registry(custom):
    import fsparse
    defs = [{"name": c["name"], "params": c.get("raw_params") or c["params"], "brackets": c.get("brackets"),
             "firstParamCondition": c.get("first_param_condition")} for c in custom.values()]
    return fsparse.Registry.load(PACKAGES, custom=defs)


_LINTER = {}


def _linter(custom, enums):
    import fslint_engine
    key = id(custom)
    if key not in _LINTER:
        _LINTER[key] = fslint_engine.Linter(_registry(custom))
    return _LINTER[key]


def lint_code(code, sigs, custom, enums, label="", cmd_registry=None, params=None, kind="code"):
    """Lint one ForgeScript string (exactly what ForgeScript receives). Returns [Finding]
    with line/col inside that string."""
    findings = []
    for f in _linter(custom, enums).lint(code, kind=kind, params=params):
        line, col = get_line_col(code, f.start)
        findings.append(Finding(f.severity, f.rule, f.message, line, col, fix=f.fix,
                                context=get_context_line(code, f.start)))
    return findings


# ── Simulator (v3: full execution tree) ────────────────────────────────────

def simulate(code, sigs, custom, enums):
    """Execution order as ForgeScript runs it. unwrap:true functions resolve all their fields
    first (left to right, inner calls first); unwrap:false functions (control flow) get their
    fields as code and decide what runs. Numbers are ForgeScript's own call indices."""
    import fsparse
    reg = _registry(custom)
    res = fsparse.parse(code, reg, recover=True)
    for e in res.errors:
        print(f"{C.RED}compile error:{C.RESET} {e}")

    def show(c, depth, lazy):
        meta = c.fn.meta or {}
        eager = bool(meta.get("unwrap")) or bool(meta.get("custom"))
        tag = f"{C.DIM}(lazy: runs only if its parent runs it){C.RESET}" if lazy else ""
        flags = ("!" if c.negated else "") + ("#" if c.silent else "")
        print(f"{'  ' * depth}#{c.index} {C.BOLD}{c.name}{C.RESET}{(' ' + flags) if flags else ''} {tag}")
        for i, f in enumerate(c.fields or []):
            subs = f.functions
            label = f"{f.op}" if isinstance(f, fsparse.ConditionField) else ""
            if subs or label:
                print(f"{'  ' * (depth + 1)}{C.DIM}field {i}{(' condition ' + label) if label else ''}:{C.RESET}")
            for s in subs:
                show(s, depth + 2, lazy or not eager)

    for c in res.functions:
        show(c, 0, False)
    print(f"\n{C.DIM}output template:{C.RESET} {res.render()!r}")
    print(f"{C.DIM}Eager calls run in index order; a function's own body runs after its fields.{C.RESET}")


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

    # Command usage (v4: include functions/ dir + bare calls via loose scanner)
    print(f"\n{C.BOLD}Custom function usage by commands:{C.RESET}")
    fn_usage = defaultdict(list)
    for cmd_dir in (root / "prefixesCmd", root / "slashesCmd",
                    root / "events", root / "functions"):
        if not cmd_dir.exists():
            continue
        for js in cmd_dir.rglob("*.js"):
            text = js.read_text(encoding="utf-8")
            for cm in re.finditer(r"\$[!#]?(\w+)(?:\[|\b)", text):
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
        print(f"│   ${sig['name']}[{';'.join(sig_parts)}]")
        print(f"│   {C.DIM}brackets: {sig.get('brackets')}  ·  package: {sig.get('package', '?')}"
              f"{'  ·  arguments resolved before the call' if sig.get('unwrap') else '  ·  fields passed as code (control flow)'}{C.RESET}")

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
    import fsextract
    path = Path(path)
    files = []
    if path.is_dir():
        for pattern in ("prefixesCmd/**/*.js", "slashesCmd/**/*.js", "functions/**/*.js", "events/**/*.js",
                        "commands/**/*.js"):
            files.extend(p for p in path.glob(pattern) if "node_modules" not in p.parts)
    elif path.is_file():
        files = [path]
    else:
        print(f"Error: {path} not found")
        return 1

    params_by_code = {}
    for cf in custom.values():
        if cf.get("code_source") is not None:
            params_by_code[(cf["file"], cf["code_source"].start)] = cf["params"]

    total_errors = total_warns = total_infos = total_files = 0
    cat_counts = defaultdict(int)
    events = events if events is not None else {}

    for f in sorted(set(files)):
        raw = f.read_text(encoding="utf-8")
        sources = fsextract.extract(raw)
        if not sources:
            continue
        total_files += 1
        rel = f.relative_to(ROOT) if f.is_relative_to(ROOT) else f
        file_findings = []
        for src in sources:
            if src.error:
                ln, col = fsextract.line_col(raw, src.start)
                file_findings.append(Finding("error", "js-string", f"Could not read this {src.prop} string: {src.error}", ln, col))
                continue
            params = params_by_code.get((str(rel), src.start))
            for fd in _linter(custom, enums).lint(src.value, kind=src.prop, params=params):
                ln, col = fsextract.line_col(raw, src.file_pos(fd.start))
                line_text = raw.splitlines()[ln - 1].strip() if ln - 1 < len(raw.splitlines()) else ""
                msg = fd.message + (" (string uses ${...}: some text is only known at runtime)" if src.dynamic else "")
                file_findings.append(Finding(fd.severity, fd.rule, msg, ln, col, fix=fd.fix, context=line_text))

        if events:
            for tm in re.finditer(r'type:\s*["\']([/\w]+)["\']', raw):
                if is_inside_comment(raw, tm.start(1)):
                    continue
                ev_name = tm.group(1)
                ln = raw[: tm.start(1)].count("\n") + 1
                if ev_name not in events:
                    file_findings.append(Finding("error", "event-type",
                        f'Unknown event type "{ev_name}": not an event of the loaded packages', ln))

        # one "experimental" note per function per file is enough
        seen_exp, kept = set(), []
        for x in file_findings:
            if x.category == "experimental":
                key = x.message.split(" ")[0]
                if key in seen_exp:
                    continue
                seen_exp.add(key)
            kept.append(x)
        file_findings = kept
        if file_findings:
            file_findings.sort(key=lambda x: (x.line or 0, x.col or 0))
            total_errors += sum(1 for x in file_findings if x.severity == "error")
            total_warns += sum(1 for x in file_findings if x.severity == "warn")
            total_infos += sum(1 for x in file_findings if x.severity == "info")
            print(f"\n{C.BOLD}{rel}{C.RESET}")
            for finding in file_findings:
                print(finding)
                cat_counts[finding.category] += 1

    print(f"\n{'─' * 60}")
    print(
        f"Linted {C.BOLD}{total_files}{C.RESET} files (packages: {', '.join(PACKAGES or ['all'])}): "
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
    """Signature help: given partial ForgeScript code, report the call and argument the end of
    the text is in, using the exact parse (so it agrees with where ForgeScript ends calls)."""
    import fsparse
    res = fsparse.parse(code, _registry(custom), recover=True)
    print(f"{C.BOLD}┌─ Signature help{C.RESET} " + "─" * 36)
    target, active = None, 0
    for c in res.walk():   # innermost call still open at the end of the text
        if c.close is None and c.fields is not None and c.open is not None:
            target, active = c, len(c.fields) - 1
    if target is None:
        print(f"│ {C.RED}the end of this text is not inside an open call{C.RESET}")
        print(f"{C.BOLD}└{C.RESET}" + "─" * 50)
        return 1
    token = target.written
    fname = target.name.lstrip("$").lower()
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
    """Every call in a file with its exact line span, from the real parse tree."""
    import fsextract, fsparse
    p = Path(path)
    if not p.exists():
        print(f"Error: {path} not found")
        return 1
    raw = p.read_text(encoding="utf-8")
    reg = _registry(custom)
    for src in fsextract.extract(raw):
        if src.prop != "code" or src.error:
            continue
        ln, _ = fsextract.line_col(raw, src.start)
        print(f"{C.BOLD}code @ line {ln}{C.RESET}")
        res = fsparse.parse(src.value, reg, recover=True)

        def walk(calls, depth):
            for c in calls:
                a, _ = fsextract.line_col(raw, src.file_pos(c.start))
                b, _ = fsextract.line_col(raw, src.file_pos(max(c.end - 1, c.start)))
                span = f"{a}" if a == b else f"{a}-{b}"
                print(f"  {'  ' * depth}{c.name}  {C.DIM}line {span}{C.RESET}")
                for f in c.fields or []:
                    walk(f.functions, depth + 1)
        walk(res.functions, 0)
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


def mode_parse(code, custom):
    import fsparse
    reg = _registry(custom)
    res = fsparse.parse(code, reg, recover=True)
    fsparse._print_tree(res.functions)
    print(f"output: {res.render()!r}")
    for e in res.errors:
        print(f"{C.RED}compile error:{C.RESET} {e}")
    for n in fsparse.name_issues(code, reg, res):
        print(f"note: {n.written} " + (f"runs {n.runs} followed by the text {n.rest!r}" if n.kind == "glued"
                                       else "is not a function; it is printed as text"))
    return 1 if res.errors else 0


def mode_run(code):
    """Run on the real interpreter (tools/fsrun.js). Offline: Discord calls can't work."""
    import subprocess
    p = subprocess.run(["node", str(Path(__file__).resolve().parent / "fsrun.js")],
                       input=json.dumps({"id": 0, "code": code}) + "\n", capture_output=True, text=True)
    if p.returncode or not p.stdout.strip():
        print(f"{C.RED}Could not run ForgeScript:{C.RESET} {p.stderr.strip()[-400:] or 'no output'}")
        print("Install it next to this repo (npm i) or set FS_MODULE to node_modules/@tryforge/forgescript.")
        return 2
    r = json.loads(p.stdout.splitlines()[0])
    if r["result"] is not None:
        print(f"output: {r['result']!r}")
    else:
        print(f"{C.YELLOW}the run stopped{C.RESET}" + (f": {r['error']}" if r["error"] else " (no error: a gate, $stop, or a hidden $# error)"))
    return 0 if r["result"] is not None else 1


def mode_self_test():
    """Check fslint's own foundations against Node/ForgeScript where available."""
    import subprocess, fsextract, fslint_engine
    here = Path(__file__).resolve().parent
    ok = True
    # 1. JS string cooking == Node's own values
    node = subprocess.run(["node", str(here / "fs_extract.js"), "js", "."], cwd=ROOT, capture_output=True, text=True)
    if node.returncode == 0:
        from collections import Counter, defaultdict as dd
        want = dd(Counter)
        for line in node.stdout.splitlines():
            d = json.loads(line)
            f, rest = d["id"].split(":", 1)
            want[f][(rest.split("#")[0], d["code"])] += 1
        bad = 0
        for f, cnt in want.items():
            got = Counter((s.prop, s.value) for s in fsextract.extract((ROOT / f).read_text(encoding="utf-8")) if not s.dynamic)
            bad += sum((cnt - got).values()) + sum((got - cnt).values())
        print(f"{'PASS' if not bad else 'FAIL'}  JS string extraction matches Node on {sum(sum(c.values()) for c in want.values())} strings ({bad} differences)")
        ok &= not bad
    else:
        print(f"SKIP  JS string extraction (node: {node.stderr.strip()[:120]})")
    # 2. custom function loader == what ForgeFunction receives
    node = subprocess.run(["node", str(here / "fs_extract.js"), "fns", "functions"], cwd=ROOT, capture_output=True, text=True)
    if node.returncode == 0 and node.stdout.strip():
        want = {(d["name"], json.dumps(d["params"]), d["brackets"], d["firstParamCondition"], d["code"])
                for d in map(json.loads, node.stdout.splitlines())}
        got = {(d["name"], json.dumps(d["params"]), d["brackets"], d["firstParamCondition"], d["code"])
               for d in fslint_engine.load_custom_functions(ROOT)}
        print(f"{'PASS' if want == got else 'FAIL'}  custom functions match Node ({len(want)} functions, {len(want ^ got)} differences)")
        ok &= want == got
    # 3. rule tests on the real interpreter, 4. parser differential test
    pk = [x for x in (PACKAGES or []) if x != "ForgeScript"] + ["ForgeScript"]
    for script, args in (("test_fslint.py", []), ("test_fsparse.py", ["--fuzz", "3000", "--packages", ",".join(pk)])):
        p = subprocess.run([sys.executable, str(here / script), *args], capture_output=True, text=True)
        lines = p.stdout.strip().splitlines() or ["(no output)"]
        for extra in lines[:-1]:
            if extra.startswith(("registry", "SKIP")):
                print(f"      {extra}")
        print(f"{'PASS' if p.returncode == 0 else 'FAIL'}  {script}: {lines[-1]}")
        ok &= p.returncode == 0
    return 0 if ok else 1


# ── Main ───────────────────────────────────────────────────────────────────

def arg_after_flag(flag):
    i = sys.argv.index(flag)
    if i + 1 >= len(sys.argv):
        print(f"Usage: fslint.py {flag} '<ForgeScript code>'")
        sys.exit(1)
    return sys.argv[i + 1]


def main():
    global PACKAGES
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    if "--packages" in sys.argv:
        PACKAGES = sys.argv[sys.argv.index("--packages") + 1].split(",")
    elif os.environ.get("FSLINT_PACKAGES"):
        PACKAGES = os.environ["FSLINT_PACKAGES"].split(",")
    else:
        import fslint_engine
        PACKAGES = fslint_engine.detect_packages(ROOT)
    if "--self-test" in sys.argv:
        return mode_self_test()
    sigs = load_signatures()
    custom = load_custom_functions(ROOT)
    enums = load_enums()
    cmd_registry = load_command_registry(ROOT)
    events = load_events()

    if not sigs:
        print("Error: no function metadata. Run tools/build_fs_metadata.py.")
        return 1

    if "--parse" in sys.argv:
        return mode_parse(arg_after_flag("--parse"), custom)
    if "--run" in sys.argv:
        return mode_run(arg_after_flag("--run"))

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

    if "--snippet" in sys.argv or "--js-snippet" in sys.argv:
        flag = "--snippet" if "--snippet" in sys.argv else "--js-snippet"
        idx = sys.argv.index(flag)
        if idx + 1 < len(sys.argv):
            text = sys.argv[idx + 1]
            if flag == "--js-snippet":  # as written inside a template literal: cook like JavaScript
                import fsextract
                text = fsextract.cook("`" + text + "`", 0, "`")[0]
            findings = lint_code(text, sigs, custom, enums, cmd_registry=cmd_registry)
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
