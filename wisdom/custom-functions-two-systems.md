# Custom functions — the two-system trap (audit #4)

> Source: `../../code/custom-functions-tutorial/` (submitted 2026-09-26). This audit corrected **my own documentation** — the clearest proof yet that submissions beat assumptions.

## The finding

ForgeScript has **two custom-function systems with confusingly similar callers**:

| | ForgeFunctions | Local functions |
|---|---|---|
| Defined | `client.functions.add({...})` in index.js, or `functions:` folder files (`module.exports = [{name, params, code}]`) | `$fn[name;code;params]` / `$localFunction` inside running code |
| Registry | `ctx.client.functions` (persists on the client) | the execution `Context` (dies with the run) |
| Env semantics | **clone** — env writes inside a ForgeFunction do NOT escape to the caller | **shared** — `$callLocalFunction` runs on the caller's env; writes DO escape (verified live; the "writes don't escape" claim applies only to `functions.add`) |
| Call it with | **`$callFunction[name;args...]`** — or **directly** `$name[...]` (registration promotes it into the FunctionManager as a real native function) | **`$callFn[name;args...]`** / `$callLocalFunction` |
| Wrong caller gives | `UnknownXName: function` error | `UnknownXName: local function` error |

The tutorial's flow is the canonical ForgeFunction recipe:

```js
client.functions.add({
    name: "admin",
    params: ["guild", "user"],           // string shorthand = required String params
    code: `$return[$hasPerms[$env[guild];$env[user];Administrator]]`
})
```

```fs
$callFunction[admin;$guildID;$mentioned[0]]   // → "true"/"false"
$admin[$guildID;$mentioned[0]]                // direct form — equally valid
```

Both verified in source: `$callFunction` resolves against `client.functions`; `ForgeFunctionManager.populate()` registers every definition into the global FunctionManager (which is why the timeout system could call `$advancedTimeout[...]` bare). Direct invocation is the *primary* style in real systems; `$callFunction` earns its keep for **dynamic names** (name computed at runtime).

## Details confirmed along the way

- `$return[...]` inside custom-function code is mandatory for a value — the body runs with `allowTopLevelReturn` and its container is `doNotSend`; stray text output is discarded (see `../knowledge/core/custom-functions.md`).
- String-shorthand params (`"guild"`) = required String; object form for types/optional/rest.
- Params land in env under their exact names → `$env[guild]` (or `$get[guild]`).
- Registration is compile-visible: custom functions registered before commands load are matched by the compiler's function regex like any native; adding later needs re-registration (and won't recompile already-loaded command files — the tutorial's "restart your bot" step is the honest workaround).
- `$hasPerms[guildID*;userID*;perms*(Enum)]` — pointer pair (Member resolves against the Guild arg), third arg is the `PermissionFlagsBits`-keyed enum (camelCase, e.g. `Administrator`).

## Wisdom for writing custom functions

1. Default to the **module-file + `functions:` folder** style (hot-reloads with the loader, keeps index.js clean) — `client.functions.add` is for programmatically generated definitions.
2. Prefer **direct invocation** in command code; reach for `$callFunction` only when the target name is data.
3. `$fn`/`$callFn` for helpers *inside one execution* (like the timeout system's `throwError`); ForgeFunctions for anything used across commands.
4. The `params` → `$env[name]` bridge means param names are a public API — renaming one silently breaks every caller.

## Community-verified authoring patterns (2026-09-28 field study)

From `forge.timers`, `fsgames`, and ForgePages — extension-grade uses of the authoring layer:

1. **Core-name override is possible and real.** An extension's `NativeFunction`s can re-register `$setTimeout`-family names as signature *supersets* — ForgeTimers ships as a drop-in override. Corollary hazard: two extensions can fight over one name (ForgeTimers vs ForgeCron both register `$cron`, different arg orders).
2. **Env-key accumulator builder DSL** (fsgames): a parent function (`$startConnect4Game`) takes field 0 as raw code, calls `this.getFunctions(0, {name})` to *filter which sub-functions ran in it*, each setter writes into one hidden env key (`ctx.setEnvironmentKey("__c4__game__options__", ...)`) which the parent consumes then `deleteEnvironmentKey`s. Setters refuse to run when the accumulator key is absent — scope enforcement for free. This is exactly how the official `$addActionRow`/`$addButton` family works, now verified in community code.
3. **Typed client state via module augmentation** (ForgePages): `declare module "@tryforge/forgescript" { interface ForgeClient { pageStores?: Map<...> } }` — the clean way for an extension to expose state on the client without `any`.
4. **Versioned snapshot codec** (forge.timers `PersistedVars.ts`): when persisting an env across restarts, tag non-JSON types (Date/Map/Set/BigInt) under a `$forge` discriminator with a schema version, drop per-value with logging, and encode `Infinity` as a string sentinel — JSON storage lies less when you design the codec.
