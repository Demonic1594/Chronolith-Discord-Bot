# $javaMods

> Returns the mods of a java server

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `java` | v1.0.0 | optional | yes | `Json`, `String[]` |

## Signature

```fs
$javaMods[host;port;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `host` | `String` | no | no | The host domain of the server |
| 2 | `port` | `Number` | no | no | The port of the host connection |
| 3 | `property` | `Enum` | no | no | The property to return |
| 4 | `separator` | `String` | no | no | The separator to use for each value |

### Per-parameter notes

- **`host`** (`String`, optional): The host domain of the server. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`port`** (`Number`, optional): The port of the host connection. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The property to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$javaMods` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$javaMods[value]
```

**Full form (all arguments)**

```fs
$javaMods[value;5;value;,]
```

## Reference implementation (source)

Taken from `src/native/java/javaMods.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        const mods = (await ctx.client.minecraft.getJavaStatus(host, port || undefined).catch(ctx.noop))?.mods
        if (!mods || prop) return this.success(mods?.map((x) => x[prop!]).join(sep ?? ", "))
        return this.successJSON(mods)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`host`, `port`, `property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$javaEulaBlocked`]($javaEulaBlocked.md)
- [`$javaHost`]($javaHost.md)
- [`$javaIPAddress`]($javaIPAddress.md)
- [`$javaIcon`]($javaIcon.md)
- [`$javaMOTD`]($javaMOTD.md)
- [`$javaMaxPlayers`]($javaMaxPlayers.md)
- [`$javaPlayerCount`]($javaPlayerCount.md)
- [`$javaPlayerList`]($javaPlayerList.md)

**Source:** [`src/native/java/javaMods.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/java/javaMods.ts)
