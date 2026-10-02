# $saveServer

> Saves the minecraft server

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | optional | yes | — |

## Signature

```fs
$saveServer[flush]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `flush` | `Boolean` | **yes** | no | Whether to save chunks to disk immediately, defaults to true |

### Per-parameter notes

- **`flush`** (`Boolean`, required): Whether to save chunks to disk immediately, defaults to true. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$saveServer` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$saveServer[true]
```

## Reference implementation (source)

Taken from `src/native/management/saveServer.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        await ctx.client.minecraft.server?.save(flush ?? true).catch(ctx.noop)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
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

**Source:** [`src/native/management/saveServer.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/saveServer.ts)
