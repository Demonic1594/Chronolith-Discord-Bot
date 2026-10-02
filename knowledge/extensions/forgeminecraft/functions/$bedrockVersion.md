# $bedrockVersion

> Returns the version of a bedrock server

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `bedrock` | v1.0.0 | optional | yes | `Json`, `Unknown` |

## Signature

```fs
$bedrockVersion[host;port;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `host` | `String` | no | no | The host domain of the server |
| 2 | `port` | `Number` | no | no | The port of the host connection |
| 3 | `property` | `Enum` | no | no | The property to return |

### Per-parameter notes

- **`host`** (`String`, optional): The host domain of the server. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`port`** (`Number`, optional): The port of the host connection. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The property to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$bedrockVersion` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$bedrockVersion[value]
```

**Full form (all arguments)**

```fs
$bedrockVersion[value;5;value]
```

## Reference implementation (source)

Taken from `src/native/bedrock/bedrockVersion.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        const version = (await ctx.client.minecraft.getBedrockStatus(host, port || undefined).catch(ctx.noop))?.version
        if (!version || prop) return this.success(version?.[prop!])
        return this.successJSON(version)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`host`, `port`, `property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bedrockEdition`]($bedrockEdition.md)
- [`$bedrockEulaBlocked`]($bedrockEulaBlocked.md)
- [`$bedrockGameMode`]($bedrockGameMode.md)
- [`$bedrockHost`]($bedrockHost.md)
- [`$bedrockIPAddress`]($bedrockIPAddress.md)
- [`$bedrockMOTD`]($bedrockMOTD.md)
- [`$bedrockMaxPlayers`]($bedrockMaxPlayers.md)
- [`$bedrockPlayerCount`]($bedrockPlayerCount.md)

**Source:** [`src/native/bedrock/bedrockVersion.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/bedrock/bedrockVersion.ts)
