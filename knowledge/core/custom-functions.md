# Custom functions (ForgeFunction) — the authoring layer the function index doesn't show

> Ground truth: `src/structures/forge/ForgeFunction.ts`, `src/managers/ForgeFunctionManager.ts`, `src/native/other/{localFunction,callLocalFunction,escapeCode}.ts`. Verified against a real production system (`../../code/advanced-timeout-system/`).

The 1,120 indexed functions are *native*. ForgeScript also lets you **define your own `$functions` in JS files** — a completely separate mechanism the docs site indexes nowhere. Real bots (like the advanced-timeout system) are built on it.

## The module format

```js
// functions/advancedTimeout.js
module.exports = [{
    name: 'advancedTimeout',        // becomes $advancedTimeout
    description: '...',             // cosmetic
    params: [                       // optional; string shorthand or objects
        { name: '_code', type: 'String', required: true, rest: false },
        { name: '_data', type: 'Json', required: false, rest: false },
        // 'justAName' shorthand = required String
    ],
    firstParamCondition: false,     // treat param 0 as a condition field (see $if)
    brackets: true,                 // default: true if params exist, else "no brackets"
    output: 'Json',                 // documentation hint only
    code: `
        $env[_code] ...             // the ForgeScript body
    `,
}]
```

Definitions may be exported three ways — plain objects, **class instances** (`new ForgeFunction({...})` — maintainer style, gives type-checking), or arrays of either. Slash commands and regular commands have their own instance classes too: `new ApplicationCommand({ data, code })`, `new BaseCommand({ type, code })` — managers' `.add()`/`.load()` accept objects and instances alike. Loading:

```js
const client = new ForgeClient({ ..., functions: './functions' })  // auto-load
// or: client.functions.load('./functions')   — recursively requires every .js
// or: client.functions.add({ name: 'x', code: '...' })  — programmatic
```

## ForgeDB's static variable API

`ForgeDB.variables(require("./variables.json"))` — declares **default values** for DB variables up front (`{"main": "#552dd0", "red": "Red"}`): `$getGlobalVar[main]` returns the default even when never set. Maintainer pattern for theme/config variables.

## Execution mechanics (all source-verified)

1. **Registration**: each definition compiles to a real native function registered in the global FunctionManager — callable from any command, indistinguishable from core.
2. **`unwrap` is derived, not declared**: `params.length && !firstParamCondition` → unwrap **true**. Consequence: **params are resolved before your code runs** (inner `$functions` execute, types coerce). This is why passing *code* as a param requires `$escapeCode[...]` — see below.
3. **Params become ENVIRONMENT keys, verbatim names**: each resolved param is written with `setEnvironmentKey(paramName, value)` — so read them with **`$env[_code]`**. `$get[_code]` reads the *keywords* store (a completely separate map) and returns **empty** — a verified silent-failure trap. The `_code`/`_time` underscore prefix is pure style, but it's a good convention: it avoids colliding with `$let[code]` working variables.
4. **Runs in a cloned context**: `doNotSend: true` (a custom function **never sends the final message itself**) and `allowTopLevelReturn: true` (`$return[...]` sets its output value; bare falling-through code output is discarded). **But the container is SHARED with the caller** (the clone spreads runtime references) — embeds/components built inside a custom function ride the parent's outgoing send. An error inside a custom function silently stops the *parent* too (the call returns a failed Return, `fn.stop()` semantics).
5. **The env clone is a shallow copy** (`{ ...env }`): `$let` writes inside the custom function **do not propagate back to the caller** (keywords are copied at clone time unless `syncVars`). To pass data out: `$return` a value, or write to a DB (`$setGlobalVar`), or mutate JSON loaded *before* the clone only if the same object references are shared (arrays/objects copied shallowly — nested mutations of pre-existing objects DO propagate; new keys do not). **Exception — LOCAL functions are different**: `$callLocalFunction`/`$callFn` invocations run against the CALLER's context directly — `$let` writes inside a local function **DO escape** to the caller (verified in production code that depends on it). The clone applies to ForgeFunctions (`functions.add` / `functions:` folder) only.
6. **Validation**: calling with fewer args than required params → error `Calling custom function <name> requires N argument(s), received M`.
7. **Compiled once, cached** (`compiled ??=`) — code changes require a reload/restart.

## The inner-function toolkit

There are **two distinct custom-function systems** — do not confuse their callers:

1. **ForgeFunctions** — persistent, registered on the client (`client.functions.add(...)` or `functions:` folder files). The registry `ctx.client.functions`.
2. **Local functions** — per-execution, defined inline with `$fn`/`$localFunction` inside running code. Live on the `Context`.

| Function | Aliases | Signature | System | What it does |
|---|---|---|---|---|
| `$callFunction` | — | `[name*; args(rest)]` | **ForgeFunction** (client registry) | Looks up `client.functions.get(name)` and runs it with resolved args |
| *(direct call)* | — | `$myFunc[args]` | **ForgeFunction** | Registered ForgeFunctions also become real native functions — calling `$admin[...]` directly works (verified: the advanced-timeout system calls `$advancedTimeout[...]` bare) |
| `$localFunction` | `$fn` | `[name*; code*; params(rest)]` | **local** | Defines a named local function in the current context; params land in env under their names |
| `$callLocalFunction` | `$callFn` | `[name*; args(rest)]` | **local** | Invokes a context-local function; arg-count validated; params set as env keys; returns the code's resolved value |
| `$function` | — | `[code(rest)]` | — | **IIFE**: runs raw code now, `$return[...]` inside sets its value (classic inline-computation block) |
| `$escapeCode` | `$esc` | `[code*]` | — | **Freeze ray**: returns `rawValue` — the field's *uncompiled source text*. `unwrap: false`, so nothing inside resolves. This is how code is passed as data |
| `$eval` | — | `[code*; send]` | — | Thaw: compiles+runs a code string (unsafe category) — the pair with `$escapeCode` |

The naming trap: `$callFunction` (client registry) vs `$callLocalFunction`/`$callFn` (context-local). Wrong pairing = `UnknownXName` error. When in doubt: defined in `index.js`/functions folder → `$callFunction` (or direct `$name[...]`); defined with `$fn[...]` inside code → `$callFn`.

The freeze/thaw pattern: `$escapeCode[$sendMessage[...]]` captures source text → store (DB/env) → later `$eval[<stored>]` executes it.

## Related env-access semantics (used heavily by custom functions)

- **Two stores, two readers**: `$let[key;v]` writes the **keywords** store (read via `$get[key]`); `$env` reads the **environment** store (populated by custom-fn params, `$jsonLoad`, `$try`'s error var, `$loop`'s counter, `$httpRequest`'s response var). Crossing the stores yields empty — no error.
- `$env[key*; ...rest]` — reads env **paths**: `$env[myJson;user;name]` walks nested objects; `$env[list;0]` indexes arrays. Returns JSON-serialized non-strings.
- `$jsonLoad[variable*;json*]` — parses JSON text into an env key. **`$jsonSet`/`$jsonDelete` then operate on the MOST RECENTLY `$jsonLoad`-ed JSON** (hidden last-loaded pointer; there's no variable parameter on the setters). Beware `$jsonSet` parseJSON-ing values: bare snowflakes lose precision past 2^53 — quote-wrap `"$value"`.
- `$loop[times*; code*; variable; asc]` — sets `variable` in env each iteration; **asc truthy counts 1→times, otherwise counts times→1** (`times: -1` = infinite). Real code passes `;i;true` and uses `$env[i]` (1-based). **Plain body output is DISCARDED** — only `$return[...]` values accumulate into the loop's result.

## Version note

`$localFunction`, `$callLocalFunction` and the ForgeFunction manager are the *current* mechanism on `main` (2026-09-26). The whole statement/experimental family (`$function`, `$loop`, `$switch`, `$try`, ...) that real custom functions lean on is flagged experimental in source — see `../../wisdom/experimental-map.md`.
