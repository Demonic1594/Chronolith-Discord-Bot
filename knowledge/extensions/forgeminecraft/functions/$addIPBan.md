# $addIPBan

> Adds an IP address to the server's ban list, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$addIPBan[ip;reason;source;expires]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `ip` | `String` | **yes** | no | The IP address to ban from the server |
| 2 | `reason` | `String` | no | no | The reason for the ban |
| 3 | `source` | `String` | no | no | The source of the ban |
| 4 | `expires` | `Date` | no | no | The expire date of the ban |

### Per-parameter notes

- **`ip`** (`String`, required): The IP address to ban from the server. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`reason`** (`String`, optional): The reason for the ban. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`source`** (`String`, optional): The source of the ban. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`expires`** (`Date`, optional): The expire date of the ban. Expects a date. A unix timestamp in milliseconds (number) or any string the JS `Date` constructor understands (`2024-01-01`, ISO strings, ...).

## How it works

See the function list below for exact signatures.

`$addIPBan` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addIPBan[value]
```

**Full form (all arguments)**

```fs
$addIPBan[value;value;value;1710000000000]
```

## Reference implementation (source)

Taken from `src/native/management/addIPBan.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(
            await ctx.client.minecraft.server?.ipBanList().add(
                ip,
                reason || undefined,
                source || undefined,
                expires || undefined
            ).catch(ctx.noop)
        ))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`reason`, `source`, `expires`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addAllowList`]($addAllowList.md)
- [`$addOperator`]($addOperator.md)
- [`$addPlayerBan`]($addPlayerBan.md)
- [`$clearAllowList`]($clearAllowList.md)
- [`$clearIPBans`]($clearIPBans.md)
- [`$clearOperators`]($clearOperators.md)
- [`$clearPlayerBans`]($clearPlayerBans.md)
- [`$getAllowList`]($getAllowList.md)

**Source:** [`src/native/management/addIPBan.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/addIPBan.ts)
