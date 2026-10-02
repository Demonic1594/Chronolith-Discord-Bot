# $removeIPBans

> Removes IP addresses from the server's ban list, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | required | yes | `Boolean` |

> aliases: $removeIPBan

## Signature

```fs
$removeIPBans[ips]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `ips` | `String` | **yes** | yes | The IP addresses to unban |

### Per-parameter notes

- **`ips`** (`String` , rest, required): The IP addresses to unban. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$removeIPBans` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `ips` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$removeIPBans[value]
```

## Reference implementation (source)

Taken from `src/native/management/removeIPBans.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(
            await ctx.client.minecraft.server?.ipBanList().remove(ips).catch(ctx.noop)
        ))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$removeIPBan` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addAllowList`]($addAllowList.md)
- [`$addIPBan`]($addIPBan.md)
- [`$addOperator`]($addOperator.md)
- [`$addPlayerBan`]($addPlayerBan.md)
- [`$clearAllowList`]($clearAllowList.md)
- [`$clearIPBans`]($clearIPBans.md)
- [`$clearOperators`]($clearOperators.md)
- [`$clearPlayerBans`]($clearPlayerBans.md)

**Source:** [`src/native/management/removeIPBans.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/removeIPBans.ts)
