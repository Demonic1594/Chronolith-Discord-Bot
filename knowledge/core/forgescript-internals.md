# ForgeScript internals — how code actually runs

> Sources: `src/core/Compiler.ts`, `src/core/Interpreter.ts`, `src/structures/@internal/{CompiledFunction,NativeFunction,Return,Context,Container}.ts`, `src/managers/*`.

## Pipeline

```
code string
  └─ Compiler.compile()          (once per load; cached per command file)
       ├─ regex-match every $function occurrence (longest-name-first, case-insensitive)
       ├─ parse bracket fields → argument/condition tree (ICompiledFunction)
       ├─ replace each call with a [SYSTEM_FUNCTION(n)] token
       └─ build resolve(args) template function that re-interpolates results
  └─ Interpreter.run(ctx)        (per execution)
       ├─ restrictions check (allowBots, guildOnly, userIDs/guildIDs)
       ├─ execute top-level CompiledFunctions in order
       │    each: CompiledFunction.execute(ctx)
       │      ├─ if unwrap: resolveArgs → resolveCode per field → resolveArg type coercion
       │      └─ fn.data.execute.call(this, ctx, args) → Return
       ├─ on Return.Error: ctx.handleNotSuccess → error content / abort
       ├─ on Return.Return: whole run resolves to that string, stops
       └─ content = resolve(args) → container.send(triggering object)
```

## Key structures

### NativeFunction (the definition)
Every `$function` in `src/native/<category>/*.ts` exports:

```ts
new NativeFunction({
    name: "$arrayAt",
    version: "1.0.0",          // "since" version, shown in docs
    description: "...",
    brackets: true,            // required | false=optional | undefined=none
    unwrap: true,              // resolve args before execute?
    aliases: ["$fn"],          // optional (example; $arrayAt itself has none)
    experimental: true,        // optional flag (docs site doesn't show it; source does)
    deprecated: true,          // optional flag
    args: [{ name, description, type: ArgType.X, required, rest, condition, pointer, enum, check }],
    output: ArgType.String,    // documentation hint; "Unknown" = varies/undocumented
    execute(ctx, [variable, index]) { /* impl */ }
})
```

### Return semantics inside `execute`
Implementations return via `this.*` helpers on `CompiledFunction`:

| Helper | Effect |
|---|---|
| `this.success(value)` | Normal result. If the call was negated (`$!fn`), value becomes `null`. If the call used `$@[sep]`, value is split and replaced with the piece count. |
| `this.successJSON(value)` | `success(JSON.stringify(value, replacer-for-bigint, 4))` — how arrays/objects become text. |
| `this.successFormatted(value)` | `util.inspect` output (JS-style representation). |
| `this.unsafeSuccess(value?)` | Success without negation/count post-processing (used internally during arg resolution). |
| `this.error(ErrorType.X, ...)` / `this.customError(msg)` | ForgeError → aborts command (unless silenced). |
| `this.stop()` | `$stop` — kill the command. |
| `this.return(value)` | `$return` — finish with a value. |
| `this.break()` / `this.continue()` | Loop control. |
| `this.notAllowed()` | Common pattern: silently stop / return empty (permission or context gates in many implementations). |

### Context (per execution)
- `ctx.runtime.keywords` — **the `$let`/`$get` store** (private `#keywords` map; `getKeyword`/`setKeyword`/`deleteKeyword` power `$get`, `$let`, `$delete`, `$has`). Values keep their JS types (arrays stay arrays) until an outer interpolation stringifies them.
- `ctx.environment` — **a separate store, read by `$env`**. Writers: custom-function params (`setEnvironmentKey(paramName, value)`), `$jsonLoad[var;json]`, `$try[code;catch;errVar]`, `$loop[times;code;counterVar]`, `$httpRequest[...,responseVar]`. **`$let[q;7]$env[q]` → empty.** The two stores never see each other's keys.
- `ctx.container` — the outgoing payload: `content`, embeds, components, files. Functions like `$title`/`$addField`/`$addButton` mutate it; `$container.send(obj)` delivers it at the end.
- `ctx.runtime.states` — `old`/`new` snapshots for update events (consumed by `state`-category functions).

### Container lifecycle (the #1 ordering-bug source)
- Embed decorators mutate `container.embeds[index ?? 0]`; `$addActionRow` pushes a new row and **buttons/menus attach to the NEWEST row** (`$addOption` attaches to the newest select) — a LIFO stack.
- `$ephemeral`/`$tts`/flags are read **at flush time** (defer/reply), not at call time — they must precede the reply.
- Any send function **flushes and RESETS** the container. `$cooldown`/`$onlyIf` error sends bypass `doNotSend` and reset it too — **embeds built before a gate are destroyed when the gate trips**.
- Custom functions **share the caller's container** (the runtime clone spreads references) — embeds/components built inside a custom function ride the parent's send; `$return` is the only outbound value.

### Error & silent mechanics (verified in source, v2.7.1)
- `Interpreter.run`: a failed top-level call → `ctx.handleNotSuccess(fn, rt)` → **always returns `false`** → `ctx["error"]()` = `throw null` → run aborts. `fn.data.silent` (`$#`) only skips the **alert** — execution still stops; nothing after it runs.
- Nested calls: `CompiledFunction.resolveCode` propagates error Returns upward **without ever reading the nested `#` flag** — nested `$#fn[...]` is ignored entirely.
- `unwrap: false` functions never enforce required args ($if[true] with missing args returns empty success).
- Unknown function names never match the compiler regex → they stay literal text; nested real functions inside them still execute.

### Compiler details worth knowing
- Function name matching is a **single giant regex** of all registered names, sorted longest-first, case-insensitive — so `$username` never gets eaten by a hypothetical `$user` prefix match, and casing never matters.
- Each parsed call is replaced by `[SYSTEM_FUNCTION(n)]` in the compiled template; the final output interpolates execution results back into the literal text via a generated JS template function.
- Compilation happens **once per command load**; changing a function's existence (e.g. extension functions) requires re-registering and re-compiling, which is why extension init order matters.

## Error types (ForgeError)

Common `ErrorType`s you will hit in reference implementations: `MissingArg`, `InvalidArgType`, `Custom`, `CompilerError`. Extension functions frequently use `this.customError("...")` for domain errors.

## What this means in practice

1. **Order of operations is deterministic**: inner functions before outer, left before right, args before body.
2. **A failing type check anywhere aborts the command** — `$try[code;catchCode;errorVar]` is the only real escape hatch. `$#fn[...]` merely hides the alert (top-level) and is ignored on nested calls.
3. **Two variable stores, never interchangeable**: `$let`/`$get` → keywords; `$env` → environment (fn params, jsonLoad, try-error, loop-counter, http-response). Reading from the wrong store silently yields empty — no error.
4. **Control-flow functions hold raw code** because `unwrap: false` skips arg resolution entirely; they compile-and-run bodies themselves (that's `$if`'s lazy branches, `$while`'s repeated body, `$try`'s catch).
5. **`$return` is powerful**: it terminates the *entire* run and defines its final output. Inside `$loop`, plain body output is DISCARDED — only `$return` values accumulate. `$function[...]` (the IIFE) converts a Return into a Success; `$if`/`$while` do not consume it.
6. **Boolean-returning Discord mutations swallow API errors** (`.catch(ctx.noop)` → `false`): `false` conflates "Discord rejected" with "exception thrown" — wrap in `$try` when the distinction matters.
