# BotForge `/v1/validate` — the ForgeScript code validator

> All behavior below was **empirically tested against the live endpoint** (2026-09-26) using real payloads; outputs are verbatim.

## Endpoint

```
POST https://api.botforge.org/v1/validate
Content-Type: application/json

{ "code": "<ForgeScript source>" }
```

- **Rate limit (anonymous tier): 5 requests/minute**, shared with every other `/v1/` endpoint. Exceeding returns HTTP 429 `{"success":false,"error":"Too Many Requests: Rate limit is 5 requests per minute for this tier."}`. Higher tiers unlock with an `X-API-Key` header (or `?key=` query fallback).
- Response always includes `strict: false` (a strict mode flag exists but is off).

## Response schema

```json
{
  "success": true,
  "endpoint": "/v1/validate",
  "strict": false,
  "total_issues": 2,
  "diagnostics": [
    {
      "type": "error",                // error | warning (warnings unobserved so far)
      "severity": "error",
      "message": "Function $log is missing bracket closure.",
      "position": { "line": 1, "column": 1 },
      "line": 1,
      "column": 1,
      "code": "$log",                 // the offending token
      "rule": "$log",                 // rule id (usually the token or 'unexpected-bracket')
      "source": "forgescript-validator",
      "context": {
        "line": 1, "column": 1,
        "lineText": "$log[hello",     // full source line
        "snippet": "$log[hello",
        "caret": "^"                  // caret points into snippet position
      },
      "suggestions": ["Add the missing closing bracket."]
    }
  ]
}
```

Columns are **1-based**. Empty/valid code → `total_issues: 0, diagnostics: []`.

## What it DOES catch (tested)

| Test | Input | Result |
|---|---|---|
| Unclosed bracket | `$log[hello` | 2 errors: `Function $log is missing bracket closure.` + `Missing closing bracket for a function call.` (positions 1 and 11) |
| Too many arguments | `$if[a==b;x;y;z;w]` | `Function $if expects 3 arguments at most, received 5.` |
| Valid nesting | `$if[1==2;$log[true];$log[false]]` inside larger code | 0 issues |
| Valid calls | `$sendMessage[123456789012345678;Hello;true] $arrayAt[myArray;1]` | 0 issues |

## What it does NOT catch (tested — important!)

| Test | Input | Result | Why it matters |
|---|---|---|---|
| Unknown functions | `$notARealFunction[abc]` | **0 issues** | The validator does not check function registration — typos pass silently. The real compiler WOULD fail with `Function $xyz is not registered.` |
| Bad argument types | `$sendMessage[12;hi;maybe] $abs[abc]` | **0 issues** | No type validation at all. `maybe` (invalid Boolean) and `abc` (invalid Number) are runtime `InvalidArgType` errors the validator can't see. |
| Missing required args | (implied by the above) | not detected | Arg-count checking only catches *too many*, not too few. |

## Validator false positives (tested — know them to read reports correctly)

The validator does **not understand two compiler features**:

1. **Combined prefixes** `$!#fn[...]` (negation + silent together) — after it, nested bracket pairs get flagged as `Unexpected opening bracket outside of a function call.` / `Extra closing bracket found outside of a function call.`
2. **The count prefix** `$@[sep]fn[...]` (e.g. `$@[, ]randomText[a;b;c]`) — same false-positive cascade, which then desyncs bracket tracking for the *rest of the line*.

Single prefixes are fine: `$!username[$authorID]` → 0 issues, `$#username[$authorID]` → 0 issues. Plain nesting is fine: `$let[x;$sum[1;2]]$get[x]` → 0 issues.

**Rule of thumb:** if a diagnostic cascade starts right after a `!#` combination or an `@[...]` count prefix, treat the following "unexpected bracket" errors as noise; the *real* compiler handles both constructs correctly (see `core/forgescript-syntax.md`).

## Ready-to-use request examples

```bash
# basic
curl -X POST https://api.botforge.org/v1/validate \
  -H "Content-Type: application/json" \
  -d '{"code":"$if[$authorID==1;hi;bye]"}'
```

```python
import json, urllib.request

def validate(code: str) -> dict:
    req = urllib.request.Request(
        "https://api.botforge.org/v1/validate",
        data=json.dumps({"code": code}).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)

print(validate("$log[hello"))
# {'success': True, 'total_issues': 2, 'diagnostics': [...], ...}
```

## Interpreting reports when helping users

1. Fix bracket-closure and arg-count errors first — they're reliable and positional.
2. Ignore diagnostics that appear *after* a `$!#`/`$@[...]` construct (false positives).
3. Never trust a clean report as "code is correct" — unknown functions and type errors only surface at runtime.
4. Map validator messages back to compiler errors: `missing bracket closure` ↔ compiler's `Function $x is missing brace closure`; `expects N arguments at most` ↔ `Function $x expects N arguments at most`.
