# $setDifficulty

> Sets the difficulty level of the world

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | required | yes | — |

## Signature

```fs
$setDifficulty[difficulty]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `difficulty` | `Enum` | **yes** | no | The difficulty level to set |

### Per-parameter notes

- **`difficulty`** (`Enum`, required): The difficulty level to set. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$setDifficulty` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setDifficulty[value]
```

## Reference implementation (source)

Taken from `src/native/management/setDifficulty.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        await ctx.client.minecraft.server?.settings().setDifficulty(transformEnum(diff, BaseDifficulty)).catch(ctx.noop)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addAllowList`]($addAllowList.md)
- [`$addIPBan`]($addIPBan.md)
- [`$addOperator`]($addOperator.md)
- [`$addPlayerBan`]($addPlayerBan.md)
- [`$clearAllowList`]($clearAllowList.md)
- [`$clearIPBans`]($clearIPBans.md)
- [`$clearOperators`]($clearOperators.md)
- [`$clearPlayerBans`]($clearPlayerBans.md)

**Source:** [`src/native/management/setDifficulty.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/setDifficulty.ts)
