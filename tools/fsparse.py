#!/usr/bin/env python3
# SPDX-License-Identifier: LGPL-3.0-or-later
#
# fsparse: the ForgeScript compiler, reimplemented in Python.
#
# The parsing algorithm reproduces ForgeScript's own compiler
# (github.com/tryforge/ForgeScript, src/core/Compiler.ts, LGPL-3.0-or-later,
# Copyright (c) 2026 BotForge) so that, for any input, fsparse produces the same
# function tree, fields, condition operators, output template, rendered text and
# compile errors (message, line and column) as ForgeScript 2.8.0. That claim is
# tested against the real compiler by tools/test_fsparse.py; run it after every
# ForgeScript release.
#
# On top of the exact ("strict") mode it adds what a linter needs:
#   * source positions for every call, name, bracket, separator and field
#   * a recovering mode that records every compile error and keeps parsing
#   * a token scan that reports names ForgeScript glues or ignores ($pingms, $giveRole)
#
# Python 3.9+, standard library only.
"""ForgeScript parser that matches the real ForgeScript compiler.

    from fsparse import Registry, parse
    reg = Registry.load()                       # tools/fs_metadata.json, all packages
    res = parse("$if[$get[a]==1;yes;no]", reg)  # strict: raises CompileError like ForgeScript
    res = parse(code, reg, recover=True)        # collects res.errors and keeps going

CLI:
    python3 tools/fsparse.py 'Pong! $pingms'           # print the tree
    python3 tools/fsparse.py --json 'code'             # same shape as tools/fsref.js
    python3 tools/fsparse.py --packages ForgeScript,ForgeDB --file cmd.txt
"""
from __future__ import annotations

import json
import re
import sys
from dataclasses import dataclass, field as dc_field
from pathlib import Path
from typing import Dict, List, Optional, Union

METADATA = Path(__file__).resolve().parent / "fs_metadata.json"

SYNTAX_OPEN, SYNTAX_CLOSE, SYNTAX_ESCAPE, SYNTAX_SEP = "[", "]", "\\", ";"

# OperatorType in Compiler.ts. Two-character operators are tried before one-character ones.
OPERATORS = ("==", "!=", "<=", ">=", ">", "<")
OP_NONE = "unknown"

# Compiler.SystemRegex: placeholders, together with any backslashes right before them.
SYSTEM_RE = re.compile(r"(\\+)?\[SYSTEM_FUNCTION\(\d+\)\]")


# ----------------------------------------------------------------- registry

@dataclass
class FnDef:
    """What the compiler knows about one function (IRawFunction)."""
    name: str                       # canonical name, e.g. "$sendMessage"
    aliases: List[str]
    has_args: bool                  # False when metadata has no `brackets` (args: null)
    required: bool                  # brackets required
    fields: List[dict]              # [{"condition": bool, "rest": bool}, ...]
    package: str = ""
    meta: Optional[dict] = None     # full metadata entry (types, enums, description...)


class Registry:
    """The compiler's function table and its name-matching regex (Compiler.setFunctions)."""

    def __init__(self, fns: List[FnDef]):
        self.functions = fns
        # Collection.set(): a later name or alias overwrites the value but keeps the key's position.
        self.by_key: Dict[str, FnDef] = {}
        for f in fns:
            self.by_key[f.name.lower()] = f
            for a in f.aliases:
                self.by_key[a.lower()] = f
        names = sorted((k[1:] if k.startswith("$") else k for k in self.by_key), key=len, reverse=True)
        # JS: /\$(\!)?(\#)?(@\[(.*?)\])?(names...)/gim. In JS `.` stops at \n \r    ,
        # and the non-unicode `i` flag never folds a non-ASCII character to ASCII, hence re.ASCII.
        self.regex = re.compile(
            r"\$(!)?(#)?(@\[([^\n\r  ]*?)\])?(" + "|".join(map(re.escape, names)) + ")",
            re.IGNORECASE | re.ASCII,
        )
        # For lint scans: every key sorted longest first.
        self.keys = names

    def get(self, name: str) -> Optional[FnDef]:
        return self.by_key.get(name.lower() if name.startswith("$") else "$" + name.lower())

    @classmethod
    def load(cls, packages: Optional[List[str]] = None, path: Path = METADATA, custom: Optional[List[dict]] = None):
        """packages: e.g. ["ForgeScript", "ForgeDB"]; None = every package in the snapshot.
        custom: custom functions [{"name": "myFn", "params": [...], "brackets": None, "firstParamCondition": False}]."""
        meta = json.loads(Path(path).read_text(encoding="utf-8"))
        wanted = set(packages) if packages else None
        seen, fns = set(), []
        # FunctionManager.load: across providers the FIRST registration of a name wins (core loads first).
        for m in meta["functions"]:
            if wanted and m["package"] not in wanted:
                continue
            if m["name"] in seen:
                continue
            seen.add(m["name"])
            fns.append(fn_from_metadata(m))
        for c in custom or []:
            f = fn_from_custom(c)
            if f.name not in seen:
                seen.add(f.name)
                fns.append(f)
        reg = cls(fns)
        reg.enums = meta.get("enums", {})
        reg.events = meta.get("events", {})
        reg.packages = meta.get("packages", [])
        return reg


def fn_from_metadata(m: dict) -> FnDef:
    b = m.get("brackets")
    return FnDef(
        name=m["name"], aliases=list(m.get("aliases") or []),
        has_args=b is not None, required=bool(b),
        fields=[{"condition": bool(a.get("condition")), "rest": bool(a.get("rest"))} for a in m.get("args") or []],
        package=m.get("package", ""), meta=m,
    )


def fn_from_custom(c: dict) -> FnDef:
    """ForgeFunction.asNative(): brackets default to true when there are params, else undefined."""
    params = c.get("params") or []
    brackets = c.get("brackets")
    if brackets is None:
        brackets = True if params else None
    fields = []
    for i, p in enumerate(params):
        rest = False if isinstance(p, str) else bool(p.get("rest"))
        fields.append({"condition": i == 0 and bool(c.get("firstParamCondition")), "rest": rest})
    name = c["name"] if c["name"].startswith("$") else "$" + c["name"]
    return FnDef(name=name, aliases=[], has_args=brackets is not None, required=bool(brackets),
                 fields=fields, package="custom", meta={"name": name, "custom": True, "params": params})


# ----------------------------------------------------------------- result types

@dataclass
class Field:
    value: str                       # text with [SYSTEM_FUNCTION(n)] placeholders, escapes resolved
    raw: str                         # source text of the field, escapes resolved, nested calls as written
    functions: List["Call"]
    start: int                       # offset of the first character of the field
    end: int                         # offset of the `;` / `]` that ended it (len(code) if unclosed)


@dataclass
class ConditionField:
    op: str                          # "==", "!=", "<=", ">=", ">", "<" or "unknown"
    lhs: Field
    rhs: Optional[Field]
    start: int = 0
    end: int = 0
    op_pos: Optional[int] = None

    @property
    def functions(self):
        return self.lhs.functions + (self.rhs.functions if self.rhs else [])


@dataclass
class Call:
    name: str                        # canonical name of the function that runs
    fn: FnDef
    index: int                       # post-order index, as ForgeScript numbers them
    negated: bool
    silent: bool
    count: Optional[str]
    fields: Optional[List[Union[Field, ConditionField]]]
    start: int                       # the `$`
    name_start: int                  # first character of the name (after ! # @[...])
    name_end: int
    written: str                     # the name as written, e.g. "$AUTHORID"
    open: Optional[int] = None       # the `[`, None without brackets
    close: Optional[int] = None      # the `]`, None without brackets / unclosed
    separators: List[int] = dc_field(default_factory=list)
    end: int = 0                     # just past the call

    @property
    def id(self):
        return f"[SYSTEM_FUNCTION({self.index})]"

    def walk(self):
        yield self
        for f in self.fields or []:
            for c in f.functions:
                yield from c.walk()


@dataclass
class CompileError(Exception):
    message: str
    line: int
    column: int
    offset: int
    kind: str = ""                  # requires-brackets | too-many-args | missing-closure

    def __str__(self):
        return f"{self.message} at {self.line}:{self.column}"


@dataclass
class ParseResult:
    code: str                        # output template, as Compiler.compile().code
    functions: List[Call]            # top-level calls
    errors: List[CompileError]
    source: str

    def walk(self):
        for c in self.functions:
            yield from c.walk()

    def render(self, values=None) -> str:
        """The text ForgeScript sends for the top level, given each top-level call's output."""
        return render(self.code, values if values is not None else [f"<{c.index}>" for c in self.functions])


def render(template: str, values: List[str]) -> str:
    """Compiler.wrap(): placeholders are filled in ORDER of appearance and any backslashes
    directly before a placeholder are dropped. Everything else is literal."""
    it = iter(values)

    def fill(_m):
        v = next(it, None)
        return "" if v is None else str(v)
    return SYSTEM_RE.sub(fill, template)


# ----------------------------------------------------------------- the compiler

class _Match:
    __slots__ = ("index", "length", "negated", "silent", "count", "fn", "written", "name_start")

    def __init__(self, m: re.Match, fn: FnDef):
        self.index = m.start()
        self.length = m.end() - m.start()
        self.negated = m.group(1) is not None
        self.silent = m.group(2) is not None
        self.count = m.group(4)  # "" for `@[]`, None without `@[...]`
        self.fn = fn
        self.written = "$" + m.group(5)
        self.name_start = m.start(5)


class _Compiler:
    def __init__(self, code: str, reg: Registry, recover: bool):
        self.code = code
        self.reg = reg
        self.recover = recover
        self.errors: List[CompileError] = []
        self.id = 0
        self.index = 0
        self.match_index = 0
        # Compiler constructor: every match is found up front; getFunction() always resolves.
        self.matches = [_Match(m, reg.by_key["$" + m.group(5).lower()]) for m in reg.regex.finditer(code)]

    # --- helpers mirroring Compiler.ts
    @property
    def match(self) -> Optional[_Match]:
        return self.matches[self.match_index] if self.match_index < len(self.matches) else None

    def char(self) -> Optional[str]:
        return self.code[self.index] if self.index < len(self.code) else None

    def peek(self) -> Optional[str]:
        return self.code[self.index + 1] if self.index + 1 < len(self.code) else None

    def back(self) -> Optional[str]:
        return self.code[self.index - 1] if 0 < self.index <= len(self.code) else None

    def locate(self, index: int):
        """Line (1-based) and column (0-based) in UTF-16 units, like Compiler.locate()."""
        before = self.code[:index]
        line = before.count("\n") + 1
        tail = before[before.rfind("\n") + 1:]
        column = sum(2 if ord(ch) > 0xFFFF else 1 for ch in tail)
        # A trailing `\` steps past the end; JS still counts each index (code[i] is undefined).
        column += max(0, index - len(self.code))
        return line, column

    def error(self, message: str, kind: str):
        line, column = self.locate(self.index)
        err = CompileError(message, line, column, self.index, kind)
        if not self.recover:
            raise err
        self.errors.append(err)
        return err

    def process_escape(self) -> str:
        self.index += 1
        nxt = self.char()
        now = self.match
        if now is not None and now.index == self.index:
            self.match_index += 1   # an escaped `$` is never a call
        self.index += 1
        return "undefined" if nxt is None else nxt  # JS string + undefined

    # --- Compiler.compile()
    def compile(self) -> ParseResult:
        out = []
        functions: List[Call] = []
        if self.matches:
            while self.match is not None:
                m = self.match
                if m.index < self.index:
                    # Unreachable in ForgeScript's grammar; the JS loop would never end here.
                    self.match_index += 1
                    continue
                escaped = False
                while m.index != self.index:
                    ch = self.char()
                    if ch == SYNTAX_ESCAPE:
                        out.append(self.process_escape())
                        escaped = True
                        break
                    out.append(ch)
                    self.index += 1
                if escaped:
                    continue
                call = self.parse_function()
                functions.append(call)
                out.append(call.id)
            out.append(self.code[self.index:])
        else:
            out.append(self.code)
        return ParseResult("".join(out), functions, self.errors, self.code)

    def parse_function(self) -> Call:
        m = self.matches[self.match_index]
        self.match_index += 1
        self.index += m.length
        fn = m.fn
        call_start, name_end = m.index, m.index + m.length
        has_fields = self.char() == SYNTAX_OPEN

        if not has_fields and fn.has_args and fn.required:
            self.error(f"Function {fn.name} requires brackets", "requires-brackets")
            return self.prepare(m, None, call_start, name_end)        # recover: call without fields
        if not has_fields or not fn.has_args:
            return self.prepare(m, None, call_start, name_end)

        open_pos = self.index
        self.index += 1
        fields: List[Union[Field, ConditionField]] = []
        separators: List[int] = []
        close: Optional[int] = None
        n = len(fn.fields)
        i = 0
        while i < n:
            is_last = i + 1 == n
            spec = fn.fields[i]
            if not spec["rest"]:
                fields.append(self.parse_any_field(m, spec))
            else:
                while True:
                    fields.append(self.parse_any_field(m, spec))
                    if self.back() != SYNTAX_SEP:
                        break
                    separators.append(self.index - 1)
            if self.back() != SYNTAX_SEP:
                close = self.index - 1 if self.back() == SYNTAX_CLOSE else None
                break
            if not (spec["rest"]):
                separators.append(self.index - 1)
            if is_last:
                self.error(f"Function {fn.name} expects {n} arguments at most", "too-many-args")
                # recover: read the extra fields so the rest of the code stays in sync
                while True:
                    extra = self.parse_any_field(m, {"condition": False, "rest": True})
                    fields.append(extra)
                    if self.back() != SYNTAX_SEP:
                        close = self.index - 1 if self.back() == SYNTAX_CLOSE else None
                        break
                    separators.append(self.index - 1)
                break
            i += 1
        call = self.prepare(m, fields, call_start, name_end)
        call.open, call.close, call.separators = open_pos, close, separators
        call.end = self.index
        return call

    def prepare(self, m: _Match, fields, start, name_end) -> Call:
        index = self.id
        self.id += 1
        return Call(name=m.fn.name, fn=m.fn, index=index, negated=m.negated, silent=m.silent,
                    count=m.count, fields=fields, start=start, name_start=m.name_start,
                    name_end=name_end, written=m.written, end=self.index)

    def parse_any_field(self, ref: _Match, spec: dict):
        f = self.parse_condition_field(ref) if spec.get("condition") else self.parse_normal_field(ref)
        self.index += 1     # skip the `;` / `]` (or step past the end when unclosed)
        return f

    def _field_loop(self, ref: _Match, on_char=None):
        """Shared body of parseNormalField/parseConditionField. Returns (value, raw, fns, closed)."""
        value, raw, fns = [], [], []
        while True:
            ch = self.char()
            if ch is None:
                return value, raw, fns, False
            if ch == SYNTAX_ESCAPE:
                c = self.process_escape()
                value.append(c)
                raw.append(c)
                continue
            if ch == SYNTAX_CLOSE or ch == SYNTAX_SEP:
                return value, raw, fns, True
            m = self.match
            if m is not None and m.index == self.index:
                start = m.index
                call = self.parse_function()
                fns.append(call)
                value.append(call.id)
                raw.append(self.code[start:self.index])
                continue
            if on_char is not None and on_char(ch, value, raw, fns):
                continue
            value.append(ch)
            raw.append(ch)
            self.index += 1

    def parse_normal_field(self, ref: _Match) -> Field:
        start = self.index
        value, raw, fns, closed = self._field_loop(ref)
        if not closed:
            self.error(f"Function {ref.fn.name} is missing brace closure", "missing-closure")
        return Field("".join(value), "".join(raw), fns, start, self.index)

    def parse_condition_field(self, ref: _Match) -> ConditionField:
        start = self.index
        state = {"op": None, "lhs": None, "op_pos": None}

        def on_char(ch, value, raw, fns):
            if state["op"] is not None:
                return False
            two = ch + (self.peek() or "")
            op = two if two in OPERATORS else (ch if ch in OPERATORS else None)
            if op is None:
                return False
            state["op"], state["op_pos"] = op, self.index
            state["lhs"] = Field("".join(value), "".join(raw), list(fns), start, self.index)
            value.clear(); raw.clear(); fns.clear()
            self.index += len(op)
            return True

        value, raw, fns, closed = self._field_loop(ref, on_char)
        if not closed:
            self.error(f"Function {ref.fn.name} is missing brace closure", "missing-closure")
        rest_start = state["op_pos"] + len(state["op"]) if state["op"] else start
        out = Field("".join(value), "".join(raw), fns, rest_start, self.index)
        if state["op"]:
            return ConditionField(state["op"], state["lhs"], out, start, self.index, state["op_pos"])
        return ConditionField(OP_NONE, out, None, start, self.index, None)


def parse(code: str, reg: Registry, recover: bool = False) -> ParseResult:
    """Compile like ForgeScript. strict (default): raises CompileError on the first error,
    exactly where ForgeScript does. recover=True: collects errors and keeps going; the tree
    is identical to strict mode whenever there are no errors."""
    return _Compiler(code, reg, recover).compile()


# ----------------------------------------------------------------- lint helpers

TOKEN_RE = re.compile(r"\$(?:!)?(?:#)?(?:@\[[^\n\r  ]*?\])?([A-Za-z0-9_]+)")


@dataclass
class NameIssue:
    kind: str          # "unknown" (stays text) | "glued" (longest prefix runs, rest is text)
    start: int
    end: int
    written: str       # e.g. "$pingms"
    runs: Optional[str] = None   # canonical name that actually runs, for "glued"
    rest: str = ""     # text printed after it


def name_issues(code: str, reg: Registry, result: Optional[ParseResult] = None) -> List[NameIssue]:
    """$words ForgeScript doesn't treat as written. Uses the same matching as the compiler,
    so `$pingms` is reported as `$ping` + "ms", and escaped `\\$names` are ignored."""
    res = result or parse(code, reg, recover=True)
    calls = {c.start: c for c in res.walk()}
    issues = []
    for m in TOKEN_RE.finditer(code):
        start, word = m.start(), m.group(1)
        # skip escaped dollars (odd number of backslashes before it)
        k, slashes = start - 1, 0
        while k >= 0 and code[k] == "\\":
            slashes += 1
            k -= 1
        if slashes % 2:
            continue
        c = calls.get(start)
        if c is None:
            issues.append(NameIssue("unknown", start, m.end(), "$" + word))
        elif c.name_end < m.end():
            issues.append(NameIssue("glued", start, m.end(), "$" + word, c.name, code[c.name_end:m.end()]))
    return issues


# ----------------------------------------------------------------- JSON (same shape as fsref.js)

def _field_json(f):
    if isinstance(f, ConditionField):
        return {"op": f.op, "lhs": _field_json(f.lhs), "rhs": _field_json(f.rhs) if f.rhs else None}
    return {"value": f.value, "rawValue": f.raw, "functions": [_call_json(c) for c in f.functions],
            "rendered": render(f.value, [f"<{c.index}>" for c in f.functions])}


def _call_json(c: Call):
    return {"name": c.name, "id": c.id, "index": c.index, "negated": c.negated, "silent": c.silent,
            "count": c.count, "fields": [_field_json(f) for f in c.fields] if c.fields is not None else None}


def to_json(code: str, reg: Registry) -> dict:
    try:
        r = parse(code, reg)
    except CompileError as e:
        return {"error": e.message, "line": e.line, "column": e.column}
    return {"code": r.code, "functions": [_call_json(c) for c in r.functions], "rendered": r.render()}


# ----------------------------------------------------------------- CLI

def _print_tree(calls, indent=0, out=sys.stdout):
    pad = "  " * indent
    for c in calls:
        flags = "".join(x for x, on in (("!", c.negated), ("#", c.silent)) if on)
        cnt = f"@[{c.count}]" if c.count is not None else ""
        alias = f"  (written {c.written})" if c.written.lower() != c.name.lower() else ""
        out.write(f"{pad}{c.name}{(' ' + flags + cnt) if flags or cnt else ''}  #{c.index}{alias}\n")
        for i, f in enumerate(c.fields or []):
            if isinstance(f, ConditionField):
                rhs = f" {f.op} {f.rhs.raw!r}" if f.rhs else ""
                out.write(f"{pad}  [{i}] condition: {f.lhs.raw!r}{rhs}\n")
                _print_tree(f.lhs.functions + (f.rhs.functions if f.rhs else []), indent + 2, out)
            else:
                out.write(f"{pad}  [{i}] {f.raw!r}\n")
                _print_tree(f.functions, indent + 2, out)


def main(argv=None):
    import argparse
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("code", nargs="?")
    ap.add_argument("--file")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--packages", help="comma-separated, e.g. ForgeScript,ForgeDB (default: all)")
    a = ap.parse_args(argv)
    code = Path(a.file).read_text(encoding="utf-8") if a.file else a.code
    if code is None:
        code = sys.stdin.read()
    reg = Registry.load(a.packages.split(",") if a.packages else None)
    if a.json:
        print(json.dumps(to_json(code, reg), ensure_ascii=False))
        return 0
    res = parse(code, reg, recover=True)
    _print_tree(res.functions)
    print(f"rendered: {res.render()!r}")
    for e in res.errors:
        print(f"error: {e}")
    for n in name_issues(code, reg, res):
        if n.kind == "glued":
            print(f"note: {n.written} runs {n.runs} followed by the text {n.rest!r}")
        else:
            print(f"note: {n.written} is not a function; it is printed as text")
    return 1 if res.errors else 0


if __name__ == "__main__":
    sys.exit(main())
