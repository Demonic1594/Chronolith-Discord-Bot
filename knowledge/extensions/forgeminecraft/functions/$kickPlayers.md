# $kickPlayers

> Kicks players from the minecraft server, returns number of kicked players

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | required | yes | `Number` |

> ⚠️ **experimental**

## Signature

```fs
$kickPlayers[message;players]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `message` | `String` | no | no | The message displayed to the players when they are kicked |
| 2 | `players` | `String` | **yes** | yes | The players to kick |

### Per-parameter notes

- **`message`** (`String`, optional): The message displayed to the players when they are kicked. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`players`** (`String` , rest, required): The players to kick. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$kickPlayers` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `players` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$kickPlayers[Hello!]
```

**Full form (all arguments)**

```fs
$kickPlayers[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/management/kickPlayers.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        const result = await ctx.client.minecraft.server?.kickPlayers(
            players.map((x) => parsePlayer(x)),
            msg || undefined
        ).catch((err) => {
            if (err?.code !== -32603) ctx.noop(err)
        })

        return this.success(result?.length || 0)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`message`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Marked **experimental** in source — behavior may change without a major version bump.
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

**Source:** [`src/native/management/kickPlayers.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/kickPlayers.ts)
