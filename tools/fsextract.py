#!/usr/bin/env python3
"""Find ForgeScript source strings in JavaScript files and cook them exactly like JavaScript.

ForgeScript never sees what you typed in a .js file: it sees the string value after
JavaScript has processed the escapes, so `\\\\;` written in a template literal reaches
ForgeScript as `\\;`, and a single `\\;` reaches it as a bare `;`. This module does that
step and keeps a map from every cooked character back to its place in the file, so
findings get real line numbers.

Handles `code:` and `name:` properties whose value is a template literal, a "double" or
'single' quoted string. Template literals with ${...} interpolation are reported as
dynamic: the interpolated parts are unknown until the bot runs.

tools/test_fsparse.py and `fslint --self-test` compare this against Node's own result
(tools/fs_extract.js) on the whole repository.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional

PROP_RE = re.compile(r"(?<![\w$.])(code|name)\s*:\s*([`\"'])")
LINE_TERMINATORS = "\n\r  "


@dataclass
class Source:
    prop: str                 # "code" or "name"
    value: str                # cooked string, as ForgeScript receives it
    offsets: List[int]        # offsets[i] = file offset of the raw text that produced value[i]
    start: int                # file offset of the opening quote
    end: int                  # file offset just past the closing quote
    dynamic: bool = False     # template literal with ${...}
    error: Optional[str] = None

    def file_pos(self, i: int) -> int:
        if not self.offsets:
            return self.start + 1
        if i >= len(self.offsets):
            return self.offsets[-1] + 1
        return self.offsets[max(0, i)]


def _skip_js_noise(text: str, i: int) -> int:
    """Skip a JS comment starting at i (if any); return the new index."""
    if text.startswith("//", i):
        j = text.find("\n", i)
        return len(text) if j < 0 else j
    if text.startswith("/*", i):
        j = text.find("*/", i + 2)
        return len(text) if j < 0 else j + 2
    return i


def cook(text: str, i: int, quote: str):
    """Cook a JS string/template literal whose opening quote is at text[i].
    Returns (value, offsets, end, dynamic, error)."""
    out, offs = [], []
    j = i + 1
    dynamic = False
    n = len(text)
    while j < n:
        c = text[j]
        if c == quote:
            return "".join(out), offs, j + 1, dynamic, None
        if quote != "`" and c in "\n\r":
            return "".join(out), offs, j, dynamic, "unterminated string"
        if quote == "`" and c == "$" and j + 1 < n and text[j + 1] == "{":
            # ${ ... } with nested braces/strings: unknown at lint time, keep a placeholder
            dynamic = True
            depth, k = 1, j + 2
            while k < n and depth:
                ch = text[k]
                if ch in "\"'`":
                    _, _, k, _, _ = cook(text, k, ch)
                    continue
                if ch == "{":
                    depth += 1
                elif ch == "}":
                    depth -= 1
                k += 1
            out.append("\u0000")  # stands for an unknown runtime value
            offs.append(j)
            j = k
            continue
        if c == "\r" and quote == "`":
            # template literals normalise CRLF and CR to LF
            out.append("\n"); offs.append(j)
            j += 2 if text.startswith("\r\n", j) else 1
            continue
        if c != "\\":
            out.append(c); offs.append(j)
            j += 1
            continue
        # escape sequence
        if j + 1 >= n:
            return "".join(out), offs, n, dynamic, "unterminated escape"
        e = text[j + 1]
        if e in LINE_TERMINATORS:            # line continuation: produces nothing
            j += 3 if text.startswith("\r\n", j + 1) else 2
            continue
        simple = {"n": "\n", "t": "\t", "r": "\r", "b": "\b", "f": "\f", "v": "\v"}
        if e in simple:
            out.append(simple[e]); offs.append(j); j += 2
            continue
        if e == "0" and not (j + 2 < n and text[j + 2].isdigit()):
            out.append("\0"); offs.append(j); j += 2
            continue
        if e == "x" and re.match(r"[0-9a-fA-F]{2}", text[j + 2:j + 4]):
            out.append(chr(int(text[j + 2:j + 4], 16))); offs.append(j); j += 4
            continue
        if e == "u":
            m = re.match(r"\{([0-9a-fA-F]{1,6})\}|([0-9a-fA-F]{4})", text[j + 2:j + 10])
            if m:
                out.append(chr(int(m.group(1) or m.group(2), 16))); offs.append(j)
                j += 2 + m.end()
                continue
            return "".join(out), offs, j, dynamic, "invalid \\u escape"
        # any other escaped character stands for itself (\\ \` \$ \' \" \[ \; ...)
        out.append(e); offs.append(j); j += 2
    return "".join(out), offs, n, dynamic, "unterminated literal"


def extract(text: str) -> List[Source]:
    """All `code:`/`name:` string values in a JS file, cooked, with position maps."""
    found = []
    i = 0
    n = len(text)
    while i < n:
        c = text[i]
        # skip comments and string literals that are not property values
        if text.startswith("//", i) or text.startswith("/*", i):
            i = _skip_js_noise(text, i)
            continue
        m = PROP_RE.match(text, i) if c in "cn" else None
        if m and (i == 0 or not (text[i - 1].isalnum() or text[i - 1] in "_$.")):
            q = m.group(2)
            qpos = m.end() - 1
            value, offs, end, dynamic, err = cook(text, qpos, q)
            found.append(Source(m.group(1), value, offs, qpos, end, dynamic, err))
            i = end
            continue
        if c in "\"'`":
            _, _, i, _, _ = cook(text, i, c)
            continue
        i += 1
    return found


def line_col(text: str, offset: int):
    line = text.count("\n", 0, offset) + 1
    col = offset - (text.rfind("\n", 0, offset) + 1) + 1
    return line, col
