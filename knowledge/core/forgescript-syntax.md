# ForgeScript core syntax — ground truth from the compiler source

> Derived from `src/core/Compiler.ts`, `src/core/Interpreter.ts` and `src/structures/@internal/CompiledFunction.ts` of the ForgeScript repository (`main` branch). This is the authoritative reference for *why* function calls behave the way they do.

## The anatomy of a function call

```fs
$functionName[arg1;arg2;...]
```

- `$` introduces every function. Function names are **case-insensitive** (`$LOG`, `$Log`, `$log` are identical) and can be resolved through their **aliases**.
- `[` ... `]` delimit the argument list. `;` separates arguments.
- Brackets availability depends on the function's `brackets` flag:
  - `true` → brackets **required**; `$log[hi]` fine, `$log` alone is a compile error (`Function $log requires brackets`).
  - `false` → brackets **optional**; the function may be used bare or with brackets.
  - `undefined` (absent) → the function **has no brackets at all**.
- Arguments containing `;` or `]` literally must escape them with `\`. A `\` before *any* character makes that character literal (also `\n` style sequences in text are just the letter `n` — the escape only protects the next character).

## The three universal prefixes

The compiler's function regex is (conceptually):

```
\$ (\!)? (\#)? (@\[(.*?)\])? <functionName>
```

So, immediately after the `$`, you may combine:

| Prefix | Meaning | Example | Effect |
|---|---|---|---|
| `!` | **negation** | `$!username[$authorID]` | Function still executes (side effects happen) but its return value is replaced with an **empty string** — output is discarded. |
| `#` | **alert-suppressor** | `$#fetchRoles[$guildID;$roleID]` | Hides the error alert — but **does NOT continue execution** (see "Error behavior" below; verified in `Interpreter.run` + `Context.handleNotSuccess`, v2.7.1). |
| `@[sep]` | **count** | `$@[, ]randomText[a; b; c]` | The string return value is split by `sep` and the function evaluates to the **number of pieces** (empty string → `0`). |

These compose: `$!#function[...]` = hide the alert and discard output.

## Nesting & evaluation order

1. The **compiler** tokenizes the whole code up front (compile-time), matching known function names, and builds a tree. **Unknown names are NOT compile errors** — the compiler regex is built only from registered names, so `$fooBar[...]` simply never matches and stays as literal text in the output. Real functions nested *inside* the unknown text still match and execute independently. (The `Function $x is not registered.` error exists in `Compiler.getFunction` but is effectively dead code — a regex match always resolves.)
2. **Execution order is left-to-right, innermost-first** when `unwrap: true`: each argument field has its own inner function list executed in order, then the argument's literal text is interpolated with those results.
3. With `unwrap: false` (control-flow functions like `$if`, `$while`, `$try`), argument fields are passed as **raw code strings**; the function compiles/runs them lazily, which is why multiple statements separated by `;` can live inside a single argument.
4. After inner resolution, each argument is **type-coerced and validated** (see `core/arg-types.md`). A failed coercion produces `InvalidArgType` and aborts the command unless silenced.
5. The top-level result is the original code text with every function replaced by its result, sent via the message container (unless the runtime requested `doNotSend`).

## Condition arguments

Arguments flagged `condition: true` (the first argument of `$if[...]`, `$while[...]`, `$elseIf[...]`, `$onlyIf[...]`, `$checkCondition[...]` — and every field of `$and[...]`/`$or[...]`) are resolved by the compiler's condition machinery and support inline comparison operators:

- `==`, `!=` — string equality comparisons.
- `<`, `<=`, `>`, `>=` — numeric comparisons (both sides coerced with `Number()`).
- **No operator** — the left-hand side is compared against the literal string `"true"` (truthy check, used by `$while[$checkCondition[...];...]` patterns).

There is **no `&&` / `||` operator support inside condition fields.** Use `$checkCondition[$and[a==b;c==d]]`-style composition instead.

### Live-verified condition traps (2026-10-01)

- **`$and[...]` / `$or[...]` take `;`-separated condition fields (rest args).** A COMMA between conditions does not split anything — `$or[$a==b,$c==d]` is ONE malformed condition that silently evaluates false (no compile error, no runtime error). This exact typo killed a component router's entire branch. Always `;`.
- Empty comparisons work: `$if[$var==;then;else]` compares against the empty string (idiomatic "is unset" check).

## Field termination: what a bare `]` destroys

The field scanner ends an argument at the first **unescaped `;` or `]`** at its bracket depth — and "at depth" counts only *function* brackets. The practical consequences, all paid for in production:

1. **Literal `]` in displayed text closes the function.** Markdown links must be written `\[text\](url)` — an unescaped `]` before the `(url)` truncates the description and reshuffles every following `$if` branch (symptom: raw source fragments leak as message text, or a stray `]` appears as output).
2. **`$math` grouping must use parentheses, never brackets.** `$math[$total-[$math[$page-1]*5]]` — the bare `[` is harmless text but its matching `]` terminates the field early; the surviving closer then leaks as a literal `]` into the message. Write `$math[$total-(($page-1)*5)]`.
3. **Inside `$djsEval` bodies the same rule kills array/object indexing** — see the `$djsEval` page's body-constraints section.
4. A bare `[` in text is inert (never opens anything) — only closers bite.

### Authoring in JS template literals (the double-escape layer)

Command files wrap DSL in `` code: `...` `` — so the FILE must contain *two* levels of escaping, and the cooking rules differ:

| DSL needs | File contains | Why |
|---|---|---|
| `\]` (literal ] in text) | `\\]` | JS template cooks `\\` → `\` |
| `` ` `` (code chip) | `` \` `` | template-literal escape |
| `\\` (one literal backslash in DSL) | `\\\\` | two layers, one each |
| plain `;` (in `$djsEval` bodies) | `;` | rest-arg rejoin makes escaping unnecessary |

A `\;` written in the FILE cooks to plain `;` (templates drop unknown-escape backslashes) — sometimes what you want, sometimes not; `\\;` cooks to `\;` which the DSL escape layer then renders as literal `;`.

## Return types (what a function can do)

Every native function resolves to a `Return`:

| Type | Meaning |
|---|---|
| `Success` | Normal result; `value` becomes the output string (or is consumed by a parent). |
| `Error` | A `ForgeError` — aborts the command unless the call was silenced with `#` or a `$try[...]` wraps it. |
| `Stop` | `$stop` — ends the current command execution immediately. |
| `Return` | `$return[...]` — ends execution and makes the *enclosing code* evaluate to the given string. |
| `Break` / `Continue` | `$break` / `$continue` — control flow for `$while`/`$loop` bodies. |

## Error behavior

- Errors bubble up and **kill the whole command** by default (the error message is logged; with `redirectErrorsToConsole` it stays off Discord).
- **The `#` prefix does NOT give you continue-on-error** (verified in source, v2.7.1):
  - `Context.handleNotSuccess` returns `false` on every path — even when `fn.data.silent` is set — and `Interpreter.run` then calls `ctx["error"]()` (`throw null`) whenever a top-level call fails. So a **top-level `$#fn[...]` hides the alert but the run still aborts** — nothing after it executes.
  - For **nested calls the `#` flag is never read at all** (`CompiledFunction.resolveCode` propagates the error Return upward without checking it). Nested `$#fn[...]` is completely ignored; the error surfaces at the top level.
- There is NO `$suppressErrors` in current ForgeScript (it exists in related languages like aoi.js — people ask constantly). **`$try[code;catchCode;errorVar]` is the only real error-recovery mechanism.**

## Interpreter context

Every execution carries a `Context`:

- `ctx.runtime.keywords` — **the `$let`/`$get` variable scope** (a private map read/written via `getKeyword`/`setKeyword`). Key-value pairs, values keep their JS types (arrays stay arrays) until an outer interpolation stringifies them.
- `ctx.environment` — **a SEPARATE store read by `$env`**. Populated by: custom-function params (`setEnvironmentKey(paramName, value)`), `$jsonLoad`, `$try`'s error variable, `$loop`'s counter variable, and `$httpRequest`'s response variable. `$let[x;...]` + `$env[x]` → **empty** (different stores). `$env` also walks nested paths (`$env[json;user;name]`).
- `ctx.container` — the outgoing message being built (content, embeds, components, files).
- `ctx.runtime` — client, command, args (`$message[N]`), states (old/new event data), local functions.
- Discord entities (`$guildID`, `$channelID`, `$authorID`, ...) come from the runtime's `obj` (the triggering message/interaction) — which is why many functions only work inside certain events.

## Compile-time errors (thrown before anything runs)

- `Function $x requires brackets`
- `Function $x expects N arguments at most` (too many `;`-separated values for a non-rest signature)
- `Function $x is missing brace closure` (unclosed `[`)

(~`Function $x is not registered.` exists in `Compiler.getFunction` but is unreachable in practice — unknown names never match the compiler regex; see "Nesting & evaluation order" above.)

## Escaping quick reference

| You want | You write |
|---|---|
| Literal `[` in text | `\[` |
| Literal `]` in text | `\]` |
| Literal `;` inside an argument | `\;` |
| Literal `\` | `\\` |
| Literal `$` before plain text (not a registered name) | `\$` works — and even a bare `$` before an unknown name is already literal |

**There is no way to escape a function call into literal text.** Writing `\$functionName[...]` (a backslash before a call) does NOT suppress it: the `[SYSTEM_FUNCTION(n)]` token replacement (`Compiler.SystemRegex`) captures the leading backslash group but the replacement drops it — **the function executes and the backslash vanishes** (verified live, v2.7.1). To print code as text, use `$c[...]` (the comment function) or build the string without the leading `$`.

Note: escaping matters inside *arguments*; text outside function calls only needs `$`/`\` care since `[`/`]` outside a function call are... still special (the compiler tracks bracket state), so escape them too when writing plain brackets.
