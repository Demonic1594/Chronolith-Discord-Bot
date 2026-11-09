#!/usr/bin/env python3
"""fslint v5 rule engine: lint rules over the exact ForgeScript parse tree (fsparse).

Every rule states the behaviour it relies on and how that was checked:
  [compiler]  reproduced by fsparse, which is differential-tested against the real compiler
  [runtime]   executed on ForgeScript 2.8.0 (KB: knowledge/_tools/verify/verify.js)
  [source]    read in ForgeScript 2.8.0 source (file named in the rule)
  [heuristic] a judgement call (style, security, likely-mistake); never stated as fact

Positions are offsets into the ForgeScript source string (what ForgeScript receives).
"""
from __future__ import annotations

import difflib
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import fsparse
from fsparse import Call, ConditionField, Field, Registry

SEVERITIES = ("error", "warn", "info")


@dataclass
class Finding:
    severity: str
    rule: str
    message: str
    start: int
    end: int
    fix: Optional[str] = None


# ----------------------------------------------------------------- JS value semantics

_JS_WS = " \t\n\v\f\r\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff"
_DEC = re.compile(r"[+-]?(?:Infinity|(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)")
_RADIX = re.compile(r"0([xXoObB])([0-9a-fA-F]+)")


def js_number(s: str) -> Optional[float]:
    """JavaScript Number(s); None where JS gives NaN."""
    t = s.strip(_JS_WS)
    if t == "":
        return 0.0
    m = _RADIX.fullmatch(t)
    if m:
        base = {"x": 16, "o": 8, "b": 2}[m.group(1).lower()]
        try:
            return float(int(m.group(2), base))
        except ValueError:
            return None
    if _DEC.fullmatch(t):
        if "Infinity" in t:
            return -math.inf if t.startswith("-") else math.inf
        return float(t)
    return None


def js_number_str(x: float) -> str:
    """String(x) in JavaScript for an integer-valued double (shortest round-trip digits)."""
    if math.isinf(x):
        return "-Infinity" if x < 0 else "Infinity"
    r = repr(float(x))
    if "e" not in r:
        return r[:-2] if r.endswith(".0") else r
    mant, exp = r.split("e")
    exp = int(exp)
    digits = mant.replace(".", "").replace("-", "")
    if exp < 21:
        whole = digits + "0" * (exp + 1 - len(digits))
        return ("-" if x < 0 else "") + whole
    return ("-" if x < 0 else "") + digits[0] + ("." + digits[1:] if len(digits) > 1 else "") + "e+" + str(exp)


TIME_UNITS = {"d": 86_400_000, "m": 60_000, "s": 1_000, "h": 3_600_000,
              "w": 604_800_000, "M": 2_592_000_000, "y": 31_104_000_000}


def time_to_ms(s: str) -> Optional[float]:
    """CompiledFunction.resolveTime: Number(s), else ms-utility's parseToMS (TimeParser in
    src/constants.ts). None = InvalidArgType. [source] + [runtime]"""
    n = js_number(s)
    if n is not None:
        return n
    total, numbers, captured = 0.0, "", ""
    for i, ch in enumerate(s):
        if ch.isascii() and ch.isdigit():
            numbers += ch
            continue
        captured += ch
        if i + 1 != len(s) and not (s[i + 1].isascii() and s[i + 1].isdigit()):
            continue
        if captured not in TIME_UNITS or not numbers:
            return None
        total += float(numbers) * TIME_UNITS[captured]
        numbers, captured = "", ""
    return total  # trailing digits without a unit are silently ignored


ID_RE = re.compile(r"\d{16,23}")
URL_RE = re.compile(r"^http?s://")           # CompiledFunction.URLRegex (sic: "http?s")
EMOJI_RE = re.compile(r"<(a)?:(\w+):(\d{16,23})>")
STRICT_ID_TYPES = {"Message", "Channel", "TextChannel", "User", "RoleOrUser", "Member", "AutomodRule",
                   "ScheduledEvent", "SoundboardSound", "StageInstance", "Invite", "Webhook"}
CACHE_ID_TYPES = {"Guild", "Role"}           # cache.get(str): a name never resolves


# ----------------------------------------------------------------- facts from source

KEYWORD_WRITERS = {"$let", "$letsum", "$letsub", "$letmulti", "$letdivide"}           # [source]
ENV_VAR_ARG = re.compile(r"^(variable|var|name|output variable|variable name)$", re.I)
ENV_WRITERS = {  # every native function that calls setEnvironmentKey, ForgeScript 2.8.0 src/native [source]
    "$arrayadvancedsort", "$arrayconcat", "$arraycreate", "$arrayevery", "$arrayfilter", "$arrayfind",
    "$arrayfindindex", "$arrayfindlast", "$arrayfindlastindex", "$arrayforeach", "$arrayload", "$arraymap",
    "$arrayreduce", "$arrayreverse", "$arrayshuffle", "$arrayslice", "$arraysome", "$arraysort",
    "$arrayunique", "$awaitmessage", "$bufferalloc", "$bufferallocunsafe", "$bufferresize",
    "$calllocalfunction", "$httprequest", "$jsonassign", "$jsonload", "$jsonset", "$loop",
    "$segmenttextsplit", "$textsplit", "$transcript", "$try", "$wson", "$wssend",
}
# Functions that only add to the outgoing message (embed/component category, no output):
# computed from metadata in Linter.__init__.
GATES_THAT_SEND = {"$cooldown", "$onlyif", "$guildcooldown", "$channelcooldown", "$usercooldown", "$membercooldown"}
BUTTON_LIKE = {"$addbutton", "$addstringselectmenu", "$adduserselectmenu", "$addroleselectmenu",
               "$addchannelselectmenu", "$addmentionableselectmenu"}
SELECT_MENUS = {"$addstringselectmenu"}
SPLIT_READERS = {"$splittext", "$getsplittextlength", "$splittextjoin", "$gettextsplitindex"}
SPLIT_WRITERS = {"$textsplit", "$segmenttextsplit"}
UNSAFE = {"$eval", "$djseval", "$exec"}
USER_INPUT = re.compile(r"\$(message|option|input|args|messageContent|mentioned)\b", re.I)
INTERACTION_ONLY = {"$option", "$input", "$customid", "$interactionreply", "$interactionupdate",
                    "$interactionfollowup", "$defer", "$showmodal", "$selectmenuvalues", "$focused"}


# ----------------------------------------------------------------- helpers

def _f(findings, sev, rule, msg, start, end, fix=None):
    findings.append(Finding(sev, rule, msg, start, max(end, start + 1), fix))


def _literal(field) -> Optional[str]:
    """The field's text if it contains no function calls (escapes already resolved)."""
    if isinstance(field, ConditionField):
        return None
    return None if field.functions else field.value


def _arg_specs(call: Call):
    m = call.fn.meta or {}
    return m.get("args") or []


def _spec_for(specs, i):
    if i < len(specs):
        return specs[i]
    if specs and specs[-1].get("rest"):
        return specs[-1]
    return None


def _field_text_spans(code: str, field: Field):
    """Literal characters of a field (outside nested calls), as (offset, char, escaped)."""
    nested = sorted((c.start, c.end) for c in field.functions)
    i, out = field.start, []
    k = 0
    while i < field.end and i < len(code):
        if k < len(nested) and i == nested[k][0]:
            i = nested[k][1]
            k += 1
            continue
        if code[i] == "\\" and i + 1 < len(code):
            out.append((i, code[i + 1], True))
            i += 2
            continue
        out.append((i, code[i], False))
        i += 1
    return out


def suggest(name: str, reg: Registry) -> Optional[str]:
    keys = list(reg.by_key)
    hit = difflib.get_close_matches(name.lower(), keys, n=1, cutoff=0.82)
    return reg.by_key[hit[0]].name if hit else None


# ----------------------------------------------------------------- the linter

class Linter:
    def __init__(self, reg: Registry, custom: Optional[Dict[str, dict]] = None, enums=None):
        self.reg = reg
        self.custom = custom or {}
        self.enums = enums if enums is not None else getattr(reg, "enums", {})
        perms = self.enums.get("PermissionFlagsBits") or []
        self.permissions = set(perms)
        self.decorators = {f.name.lower() for f in reg.functions
                           if f.meta and f.meta.get("category") in ("embed", "component") and not f.meta.get("output")}

    # -- entry point
    def lint(self, code: str, kind: str = "code", params: Optional[List[str]] = None) -> List[Finding]:
        """kind: "code" (command/function body) or "name" (compiled command name)."""
        out: List[Finding] = []
        res = fsparse.parse(code, self.reg, recover=True)
        self.compile_errors(code, res, out)
        self.names(code, res, out)
        self.operators(code, res, out)
        calls = list(res.walk())
        for c in calls:
            self.call_shape(code, c, out)
            self.arguments(code, c, out)
            self.conditions(code, c, out)
        self.escapes(code, res, calls, out)
        if kind == "code":
            self.flow(code, res, calls, out, params or [])
            self.semantics(code, res, calls, out)
            self.style(code, res, calls, out)
        return out

    # -- [compiler] the three compile errors, exactly where ForgeScript reports them
    def compile_errors(self, code, res, out):
        for e in res.errors:
            hint = {
                "requires-brackets": "Add [...] after the name, or check the name: a longer name you meant may not be loaded",
                "too-many-args": "Escape a literal ; as \\; (\\\\; inside a JS template literal), or drop the extra argument",
                "missing-closure": "Close the call with ] (an unescaped ] earlier in an argument may have closed it too soon)",
            }[e.kind]
            _f(out, "error", "compile", f"{e.message} (ForgeScript reports {e.line}:{e.column}); the command will not load",
               e.offset, e.offset + 1, hint)

    # -- [compiler] names ForgeScript reads differently from what was written
    def names(self, code, res, out):
        let_vars = {self._first_literal(c) for c in res.walk() if c.name.lower() in KEYWORD_WRITERS}
        compile_at = {e.offset for e in res.errors}
        for n in fsparse.name_issues(code, self.reg, res):
            word = n.written[1:]
            if n.kind == "glued":
                if any(n.start < o <= n.end for o in compile_at):
                    continue  # already reported as a compile error
                benign = n.runs.lower() in ("$ping", "$httpping") and n.rest.lower() == "ms"
                sev = "info" if benign else "warn"
                _f(out, sev, "glued-name",
                   f"{n.written} is not a function: ForgeScript runs {n.runs} and prints {n.rest!r} after it",
                   n.start, n.end,
                   f"Write {n.runs} {n.rest}" if benign else
                   f"If you meant another function, is its package loaded? ({suggest(n.written, self.reg) or 'no close match'})")
            else:
                if word in let_vars:
                    _f(out, "warn", "bare-variable", f"{n.written} is printed as text; to read the variable use $get[{word}]",
                       n.start, n.end, f"$get[{word}]")
                    continue
                guess = suggest(n.written, self.reg)
                _f(out, "warn", "unknown-function",
                   f"{n.written} is not a function in the loaded packages; it is printed as text",
                   n.start, n.end, f"Did you mean {guess}?" if guess else "Is the extension that adds it loaded?")

    @staticmethod
    def _first_literal(c: Call):
        if c.fields and isinstance(c.fields[0], Field) and not c.fields[0].functions:
            return c.fields[0].value
        return None

    # -- [compiler] operator prefixes the compiler does not recognise
    OP_RE = re.compile(r"\$((?:[!#]|@\[[^\]\n\r]*\])+)(\$?)")

    def operators(self, code, res, out):
        starts = {c.start for c in res.walk()}
        for m in self.OP_RE.finditer(code):
            if m.start() in starts or (m.start() > 0 and code[m.start() - 1] == "\\"):
                continue
            if m.group(2):
                _f(out, "warn", "operator-detached",
                   f"'${m.group(1)}' is followed by another $: the operators apply to nothing and are printed as text",
                   m.start(), m.end(), "Put them right after the function's $: $!#fn[...]")
            else:
                _f(out, "warn", "operator-order",
                   f"'${m.group(1)}…' is not a valid prefix (order must be ! then # then @[sep], each once); "
                   f"ForgeScript prints this call as text", m.start(), m.end(), "Use $!#@[sep]fn[...] order")

    # -- [compiler] brackets ForgeScript ignores, [runtime] missing/extra args
    def call_shape(self, code, c: Call, out):
        after = code[c.name_end:c.name_end + 1]
        if after == "[" and not c.fn.has_args:
            _f(out, "warn", "ignored-brackets",
               f"{c.name} takes no arguments: the [ after it and everything up to the next ] are printed as text",
               c.name_end, c.name_end + 1, f"Remove the brackets: {c.name}")
        elif after == "[" and c.fn.has_args and not c.fn.fields:
            _f(out, "warn", "ignored-brackets",
               f"{c.name} declares no fields: ForgeScript consumes the [ but prints the ]",
               c.name_end, c.name_end + 1)
        if c.fn.meta and c.fn.meta.get("deprecated"):
            _f(out, "warn", "deprecated", f"{c.name} is marked deprecated in ForgeScript's source", c.start, c.name_end)
        if c.fn.meta and c.fn.meta.get("experimental"):
            _f(out, "info", "experimental", f"{c.name} is marked experimental in ForgeScript's source", c.start, c.name_end)
        if c.silent and not self._is_top(c):
            pass  # reported in semantics() where top-level-ness is known

    def _is_top(self, c):
        return getattr(c, "_top", False)

    # -- [source] argument resolution (CompiledFunction.resolveArg and the resolvers)
    def arguments(self, code, c: Call, out):
        meta = c.fn.meta or {}
        if meta.get("custom"):
            return self.custom_arity(c, out)
        if not meta.get("unwrap") or c.fields is None:
            return  # unwrap:false functions resolve their own fields; no fields = no resolution
        specs = _arg_specs(c)
        fields = c.fields
        for i, spec in enumerate(specs):
            if spec.get("rest"):
                if not fields[i:] and spec.get("required"):
                    _f(out, "error", "missing-arg", f"{c.name} is missing argument '{spec['name']}' (MissingArg at runtime)",
                       c.start, c.end)
                break
            if i >= len(fields) and spec.get("required"):
                _f(out, "error", "missing-arg", f"{c.name} is missing argument '{spec['name']}' (MissingArg at runtime)",
                   c.start, c.end, f"Usage: {usage(c.fn)}")
        for i, f in enumerate(fields):
            spec = _spec_for(specs, i)
            if not spec:
                continue
            val = _literal(f)
            if val is None or "\u0000" in val:
                continue
            if val == "" and not spec.get("required"):
                continue  # optional + falsy value skips the gate [source: resolveArg]
            self.type_gate(c, i, spec, val, f, out)

    def type_gate(self, c, i, spec, val, f: Field, out):
        t = spec.get("type")
        bad = None
        if c.name.lower() == "$parsems" and i == 0:
            return  # reported by the more specific parsems rule
        if t == "Boolean":
            if val not in ("true", "false"):
                bad = "only the exact lowercase words true / false are accepted"
        elif t == "Number":
            if js_number(val) is None:
                bad = "not a number (JavaScript Number() gives NaN)"
        elif t == "Time":
            if time_to_ms(val) is None:
                bad = "not a duration: use a number of ms or units d h m s w M y with whole numbers, e.g. 1h30m (no spaces, no decimals, no 'ms')"
        elif t == "Enum":
            allowed = self.enums.get(spec.get("enum") or "", None) or spec.get("enumValues")
            if allowed and val not in allowed and not val.isdigit():
                ci = [a for a in allowed if a.lower() == val.lower()]
                bad = f"not a value of {spec.get('enum') or 'the enum'}" + (f" (case matters: {ci[0]})" if ci else "")
        elif t == "URL":
            if not URL_RE.match(val) and not EMOJI_RE.fullmatch(val):
                bad = "must start with https:// (http:// is rejected by ForgeScript's URL check)"
        elif t in STRICT_ID_TYPES:
            if not ID_RE.fullmatch(val):
                bad = "must be a 16-23 digit ID" + (" (ForgeScript only accepts numeric invite codes here; a known upstream limitation)" if t == "Invite" else "")
        elif t in CACHE_ID_TYPES:
            if not val.isdigit():
                bad = "must be an ID (it is looked up in the cache by ID; names never resolve)"
        elif t == "Permission":
            if self.permissions and val not in self.permissions:
                bad = "not a PermissionFlagsBits key (PascalCase, e.g. ManageMessages)"
        elif t == "Color":
            n = js_number(val)
            if n is not None and math.isinf(n):
                _f(out, "error", "color-number",
                   f"{c.name}: {val!r} is read as a NUMBER ({val} = Infinity in JavaScript); the command crashes",
                   f.start, f.end, f"Write #{val}")
            elif n is not None and re.fullmatch(r"[0-9]{6}", val):
                _f(out, "warn", "color-number",
                   f"{c.name}: {val!r} is read as the decimal number {int(n)} (#{int(n):06X}), not as hex #{val}",
                   f.start, f.end, f"Write #{val}")
            elif n is None and not val.startswith("#") and not re.fullmatch(r"[0-9a-fA-F]{6}", val) and val != "Random":
                _f(out, "info", "color-name",
                   f"{c.name}: {val!r} must be a discord.js Colors name (PascalCase, e.g. Blurple) or hex; anything else becomes NaN",
                   f.start, f.end)
            return
        if bad:
            sev = "error"
            _f(out, sev, "type-gate", f"{c.name} argument '{spec.get('name')}' = {val!r}: {bad} (InvalidArgType at runtime)",
               f.start, f.end)
        elif spec.get("required") and val == "" and t not in ("String", "Unknown", "Json", None):
            pass  # empty Number -> 0 etc. handled above where it fails

    def custom_arity(self, c: Call, out):
        meta = c.fn.meta
        params = meta.get("params") or []
        required = [p for p in params if isinstance(p, str) or p.get("required", True) is not False]
        n = len(c.fields or [])
        if c.fields is not None and n < len(required):
            _f(out, "error", "custom-arity",
               f"{c.name} needs {len(required)} argument(s), got {n} "
               f"('Calling custom function … requires {len(required)} argument(s)' at runtime)", c.start, c.end)

    # -- [compiler] condition fields: one operator, literal only, no && / ||
    def conditions(self, code, c: Call, out):
        for f in c.fields or []:
            if not isinstance(f, ConditionField):
                continue
            if f.op != fsparse.OP_NONE:
                lhs_txt = "".join(ch for _, ch, _e in _field_text_spans(code, f.lhs))
                if not f.lhs.functions and not lhs_txt.strip():
                    _f(out, "warn", "condition", f"{c.name}: the left side of {f.op} is empty", f.start, f.end)
                rhs_lit = "".join(ch for _, ch, esc in _field_text_spans(code, f.rhs) if not esc)
                for op in ("==", "!=", "<=", ">=", "<", ">"):
                    if op in rhs_lit:
                        _f(out, "warn", "condition",
                           f"{c.name}: only the first operator counts; the right side is the text {f.rhs.raw!r}",
                           f.start, f.end, "Combine conditions with $and[a==b;c==d]")
                        break
            else:
                lit = "".join(ch for _, ch, esc in _field_text_spans(code, f.lhs) if not esc)
                if "&&" in lit or "||" in lit:
                    _f(out, "warn", "condition", f"{c.name}: && and || are not operators in ForgeScript",
                       f.start, f.end, "Use $and[...;...] / $or[...;...]")
                elif not f.lhs.functions and lit.strip() not in ("true", "false", ""):
                    _f(out, "warn", "condition",
                       f"{c.name}: {lit!r} has no comparison operator, so it is only true when it equals the text 'true'",
                       f.start, f.end)
            if c.name.lower() in ("$and", "$or") and f.op == fsparse.OP_NONE and "," in (f.lhs.raw or "") and not f.lhs.functions:
                _f(out, "warn", "condition", f"{c.name} separates conditions with ; not ,", f.start, f.end)

    # -- [compiler] escapes and the renderer
    def escapes(self, code, res, calls, out):
        for c in calls:
            for f in c.fields or []:
                for fld in ([f.lhs] + ([f.rhs] if f.rhs else [])) if isinstance(f, ConditionField) else [f]:
                    open_lit = []
                    for pos, ch, esc in _field_text_spans(code, fld):
                        if not esc and ch == "[":
                            open_lit.append(pos)
                        elif esc and ch == "]" and open_lit:
                            open_lit.pop()  # an escaped ] closes the literal [ (e.g. markdown links)
                        elif esc and (ch.isalnum()):
                            _f(out, "info", "escape",
                               f"\\{ch} inside an argument becomes just {ch!r} (the backslash is removed)",
                               pos, pos + 2, "Use a real line break for a new line" if ch == "n" else None)
                    # brackets are not counted: a ] meant for a literal [ closes the call instead
                    if open_lit and fld.end < len(code) and code[fld.end] == "]":
                        _f(out, "warn", "bracket-in-arg",
                           f"This ] closes {c.name}, not the literal [ before it: brackets inside arguments are not "
                           f"counted, so the rest is printed as text",
                           fld.end, fld.end + 1, "Escape both: \\[ ... \\] (\\\\[ ... \\\\] in a JS template literal)")
                    if re.search(r"\\+\[SYSTEM_FUNCTION\(\d+\)\]", fld.value):
                        _f(out, "warn", "backslash-before-call",
                           f"A literal backslash right before a call in {c.name}'s argument is dropped when the text is built",
                           fld.start, fld.end)
        if re.search(r"\\+\[SYSTEM_FUNCTION\(\d+\)\]", res.code):
            _f(out, "warn", "backslash-before-call",
               "A literal backslash right before a call is dropped when the output is built", 0, 1)
        if res.functions:
            last = res.functions[-1]
            tail = code[last.end:]
            k = tail.find("\\")
            if k >= 0:
                _f(out, "info", "tail-escape",
                   "Escapes after the last call are not processed: this backslash is printed as-is",
                   last.end + k, last.end + k + 2)

    # -- variable stores and producers (source-derived writer lists)
    def flow(self, code, res, calls, out, params):
        let_vars, env_vars = {}, set(params)
        for c in calls:
            n = c.name.lower()
            first = self._first_literal(c)
            if n in KEYWORD_WRITERS and first:
                let_vars.setdefault(first, c)
            if n in ENV_WRITERS:
                for i, spec in enumerate(_arg_specs(c)):
                    if ENV_VAR_ARG.match(spec.get("name") or "") and c.fields and i < len(c.fields):
                        v = _literal(c.fields[i])
                        if v:
                            env_vars.add(v)
        for c in calls:
            n, first = c.name.lower(), self._first_literal(c)
            if not first:
                continue
            if n == "$env" and first in let_vars and first not in env_vars:
                _f(out, "warn", "store-confusion",
                   f"$env[{first}] reads the environment store, but {first} is only set with $let (a different store): it is empty",
                   c.start, c.end, f"$get[{first}]")
            if n == "$get" and first in env_vars and first not in let_vars:
                _f(out, "warn", "store-confusion",
                   f"$get[{first}] reads $let variables, but {first} is set by an environment writer ($jsonLoad, $arrayLoad, $try, $loop, params...): it is empty",
                   c.start, c.end, f"$env[{first}]")

    # -- runtime semantics with verified premises
    def semantics(self, code, res, calls, out):
        for c in res.functions:
            c._top = True
        names = [c.name.lower() for c in calls]
        for c in calls:
            n = c.name.lower()
            top = getattr(c, "_top", False)
            if c.silent and not top:
                _f(out, "info", "silent-flag", f"$# on a nested call is ignored (only top-level calls read it) [source]",
                   c.start, c.name_end)
            elif c.silent and top:
                _f(out, "info", "silent-flag",
                   f"$#{c.name[1:]} only hides the error message; if it fails, the command still stops [runtime]",
                   c.start, c.name_end, "Use $try[...] to keep going after an error")
            # $jsonSet value precision [runtime]
            if n == "$jsonset" and c.fields and len(c.fields) >= 2:
                v = _literal(c.fields[-1])
                if v and v.isdigit() and int(v) > 2 ** 53:
                    _f(out, "warn", "json-precision",
                       f"$jsonSet stores {v} as a number: it becomes {js_number_str(float(v))}; quote it to keep the ID",
                       c.fields[-1].start, c.fields[-1].end, f'"{v}"')
                if len(c.fields) >= 3:
                    var = self._first_literal(c)
                    produced = any(x is not c and x.name.lower() in ENV_WRITERS and self._first_literal(x) == var
                                   for x in calls)
                    if var and not produced:
                        _f(out, "info", "json-path",
                           f"$jsonSet[{var};…]: the first key is the env variable; every key except the last must already exist, "
                           f"or it returns false and changes nothing [runtime]", c.start, c.end)
            # $arrayIncludes needle typing [runtime]
            if n == "$arrayincludes" and c.fields and len(c.fields) >= 2:
                arr, needle = self._first_literal(c), _literal(c.fields[1])
                from_load = any(x.name.lower() == "$arrayload" and self._first_literal(x) == arr for x in calls)
                if needle and from_load and (js_number(needle) is not None) and needle.strip() != "":
                    _f(out, "warn", "array-includes",
                       f"$arrayIncludes parses {needle!r} as JSON (a number) but $arrayLoad stores strings: always false",
                       c.fields[1].start, c.fields[1].end, f'Quote the needle: "{needle}"')
            # $arrayLoad with empty values creates [""] [runtime]
            # [runtime] $arrayLoad[a] -> [] ; $arrayLoad[a;,] and $arrayLoad[a;,;] -> [""]
            if n == "$arrayload" and c.fields is not None and len(c.fields) >= 2 and (
                    len(c.fields) < 3 or _literal(c.fields[2]) == ""):
                _f(out, "warn", "phantom-element", "$arrayLoad with no values creates a one-element array [\"\"]",
                   c.start, c.end, "Use $arrayCreate[name] for an empty array")
            # $parseMS takes ms [runtime]
            if n == "$parsems" and c.fields:
                v = _literal(c.fields[0])
                if v and js_number(v) is None:
                    _f(out, "error", "parsems", f"$parseMS converts milliseconds to text; {v!r} is not a number",
                       c.fields[0].start, c.fields[0].end, f"$parseString[{v}] converts text to ms")
            # $loop discards plain body text [runtime]
            if n == "$loop" and c.fields and len(c.fields) >= 2 and isinstance(c.fields[1], Field):
                body = c.fields[1]
                txt = "".join(ch for _, ch, _e in _field_text_spans(code, body)).strip()
                if txt and not any(x.name.lower() == "$return" for x in self._nested(body)):
                    _f(out, "warn", "loop-output",
                       "Text in a $loop body is discarded; only $return[...] values are collected", body.start, body.end)
                times = _literal(c.fields[0])
                if times is not None and js_number(times) == -1:
                    inner = {x.name.lower() for x in self._nested(body)}
                    if "$break" not in inner:
                        _f(out, "error", "infinite-loop", "$loop[-1;…] never ends: there is no $break in the body", c.start, c.end)
                    elif "$wait" not in inner:
                        _f(out, "warn", "spin-loop", "$loop[-1;…] without $wait spins as fast as it can", c.start, c.end)
            # gates send what is built so far [source: cooldown.ts, onlyIf.ts, Container.send]
            if n in GATES_THAT_SEND and top:
                specs = _arg_specs(c)
                msg_i = next((k for k, a in enumerate(specs) if "code" in (a.get("name") or "").lower()), len(specs) - 1)
                has_msg = c.fields is not None and len(c.fields) > msg_i
                before = [x for x in res.functions if x.start < c.start and x.name.lower() in self.decorators]
                if before and has_msg:
                    _f(out, "warn", "gate-sends-container",
                       f"When {c.name} trips it sends everything built so far ({', '.join(sorted({b.name for b in before}))}) "
                       f"together with its message", c.start, c.name_end, f"Move {c.name} above the embed/component functions")
            # unsafe eval with user input [heuristic]
            if n in UNSAFE and USER_INPUT.search(code[c.start:c.end]):
                _f(out, "error", "security", f"{c.name} runs code that includes user input", c.start, c.end)
            if n == "$cooldown" and c.fields and USER_INPUT.search(c.fields[0].raw if isinstance(c.fields[0], Field) else ""):
                _f(out, "warn", "security", "$cooldown key built from user text: users can pick their own bucket", c.start, c.end)
        # relationships [source]
        order = [(c.start, c.name.lower(), c) for c in calls]
        order.sort()
        seen = set()
        for _, n, c in order:
            if n in BUTTON_LIKE and "$addactionrow" not in seen and "$addsection" not in seen and "$addcontainer" not in seen:
                _f(out, "warn", "component-order", f"{c.name} before any $addActionRow is silently dropped [source: addButton.ts]",
                   c.start, c.name_end, "Put $addActionRow first")
            if n == "$addoption" and not (seen & SELECT_MENUS):
                _f(out, "warn", "component-order", "$addOption with no select menu before it is silently ignored [source]",
                   c.start, c.name_end)
            if n in SPLIT_READERS and not (seen & SPLIT_WRITERS):
                _f(out, "warn", "split-order", f"{c.name} reads $textSplit's hidden store, but nothing filled it", c.start, c.name_end)
            if n == "$ephemeral" and ({"$defer", "$interactionreply"} & seen):
                _f(out, "warn", "ephemeral-late", "$ephemeral after $defer/$interactionReply has no effect (read when the reply is sent)",
                   c.start, c.name_end)
            seen.add(n)
        # [source] $nomention only disables the reply ping; these stop user/role pings
        if re.search(r"<@[!&]?(\$|\d)", code) and not (
                {"$disableallmentions", "$disablerolementions", "$disableusermentions"} & set(names)):
            _f(out, "info", "mention-ping",
               "This output contains a user/role mention that will ping; $nomention only disables the reply ping "
               "[heuristic]", 0, 1, "Add $disableAllMentions (or $disableUserMentions / $disableRoleMentions) if it shouldn't ping")
        if names.count("$cooldown") > 1:
            _f(out, "warn", "dup-cooldown", "More than one $cooldown in one run: the second sees the first's fresh timer", 0, 1)
        if "$customid" in names and "$authorid" not in names and any(x in names for x in ("$interactionupdate", "$interactionreply")):
            _f(out, "info", "author-lock", "Component handler never compares the presser with $authorID: anyone can press it", 0, 1)

    def _nested(self, field):
        for c in field.functions:
            yield from c.walk()

    # -- [heuristic] style
    def style(self, code, res, calls, out):
        def depth(c, d=0):
            m = d
            for f in c.fields or []:
                for x in f.functions:
                    m = max(m, depth(x, d + 1))
            return m
        for c in res.functions:
            d = depth(c)
            if d > 10:
                _f(out, "info", "nesting", f"{c.name} nests {d} levels deep", c.start, c.name_end)


def usage(fn) -> str:
    m = fn.meta or {}
    parts = []
    for a in m.get("args") or []:
        p = a.get("name") or "?"
        if a.get("rest"):
            p = "..." + p
        if not a.get("required"):
            p += "?"
        parts.append(p)
    if not fn.has_args:
        return fn.name
    return f"{fn.name}[{';'.join(parts)}]"


# ----------------------------------------------------------------- repo helpers

def detect_packages(root: Path, reg_meta_path=fsparse.METADATA) -> List[str]:
    """ForgeScript + the extensions this bot depends on (package.json), mapped by npm name."""
    meta = json.loads(Path(reg_meta_path).read_text(encoding="utf-8"))
    by_npm = {p["npm"]: p["name"] for p in meta.get("packages", []) if p.get("npm")}
    pkgs = ["ForgeScript"]
    pj = Path(root) / "package.json"
    if pj.exists():
        deps = json.loads(pj.read_text(encoding="utf-8"))
        names = {**deps.get("dependencies", {}), **deps.get("devDependencies", {})}
        for npm, spec in names.items():
            if npm in by_npm and by_npm[npm] not in pkgs:
                pkgs.append(by_npm[npm])
            if "quoriel/edge" in str(spec) or "nationdex/edge" in str(spec) or npm == "@quoriel/edge":
                pkgs.append("Edge")
    return pkgs


def load_custom_functions(root: Path) -> List[dict]:
    """Custom functions from the functions/ folder: name, params, brackets, firstParamCondition, code.
    Static reading of the JS; fslint --self-test compares it with Node (fs_extract.js fns)."""
    import fsextract
    out = []
    d = Path(root) / "functions"
    if not d.exists():
        return out
    for js in sorted(d.rglob("*.js")):
        text = js.read_text(encoding="utf-8")
        srcs = fsextract.extract(text)
        names = [s for s in srcs if s.prop == "name"]
        for k, s in enumerate(names):
            seg_end = names[k + 1].start if k + 1 < len(names) else len(text)
            seg = text[s.end:seg_end]
            code = next((x for x in srcs if x.prop == "code" and s.end <= x.start < seg_end), None)
            params = []
            pm = re.search(r"\bparams\s*:\s*\[", seg)
            if pm:
                j, depth = pm.end() - 1, 0
                while j < len(seg):
                    depth += {"[": 1, "]": -1}.get(seg[j], 0)
                    if depth == 0:
                        break
                    j += 1
                body = seg[pm.end():j]
                for om in re.finditer(r"\{[^{}]*\}|([\"'])(\w+)\1", body):
                    if om.group(0).startswith("{"):
                        o = om.group(0)
                        nm = re.search(r"name\s*:\s*[\"'](\w+)", o)
                        if nm:
                            params.append({"name": nm.group(1),
                                           "rest": bool(re.search(r"rest\s*:\s*true", o)),
                                           "required": not re.search(r"required\s*:\s*false", o)})
                    else:
                        params.append(om.group(2))
            bm = re.search(r"\bbrackets\s*:\s*(true|false)", seg)
            out.append({
                "name": s.value, "params": params,
                "brackets": None if not bm else bm.group(1) == "true",
                "firstParamCondition": bool(re.search(r"\bfirstParamCondition\s*:\s*true", seg)),
                "code": code.value if code else None, "code_source": code,
                "file": str(js), "line": text.count("\n", 0, s.start) + 1,
            })
    return out
