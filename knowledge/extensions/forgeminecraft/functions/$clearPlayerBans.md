# $clearPlayerBans

> Clears the server's player ban list, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | none | no | `Boolean` |

## Signature

```fs
$clearPlayerBans
```

## How it works

See the function list below for exact signatures.

`$clearPlayerBans` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$clearPlayerBans
```

## Reference implementation (source)

Taken from `src/native/management/clearPlayerBans.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        return this.successJSON(!!(
            await ctx.client.minecraft.server?.banList().clear().catch(ctx.noop)
        ))
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
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
- [`$getAllowList`]($getAllowList.md)

**Source:** [`src/native/management/clearPlayerBans.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/clearPlayerBans.ts)
