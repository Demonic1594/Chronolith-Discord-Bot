# $getIPBans

> Returns the server's IP ban list

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | optional | yes | `Json`, `Unknown[]` |

## Signature

```fs
$getIPBans[force;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `force` | `Boolean` | **yes** | no | Whether to force a direct fetch, defaults to false |
| 2 | `property` | `Enum` | no | no | The property to return |
| 3 | `separator` | `String` | no | no | The separator to use for each value |

### Per-parameter notes

- **`force`** (`Boolean`, required): Whether to force a direct fetch, defaults to false. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`property`** (`Enum`, optional): The property to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for each value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$getIPBans` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getIPBans[true]
```

**Full form (all arguments)**

```fs
$getIPBans[true;value;,]
```

## Reference implementation (source)

Taken from `src/native/management/getIPBans.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        const bans = await ctx.client.minecraft.server?.ipBanList().get(force || false).catch(ctx.noop)
        if (!bans || prop) return this.success(bans?.map((x) => IPBanProperties[prop!](x)).join(sep ?? ", "))
        return this.successJSON(bans)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addAllowList`]($addAllowList.md)
- [`$addIPBan`]($addIPBan.md)
- [`$addOperator`]($addOperator.md)
- [`$addPlayerBan`]($addPlayerBan.md)
- [`$clearAllowList`]($clearAllowList.md)
- [`$clearIPBans`]($clearIPBans.md)
- [`$clearOperators`]($clearOperators.md)
- [`$clearPlayerBans`]($clearPlayerBans.md)

**Source:** [`src/native/management/getIPBans.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/getIPBans.ts)
