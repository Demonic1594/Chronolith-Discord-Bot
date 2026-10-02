# $playerDestroy

> Destroy a player

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `player` | v1.0.0 | optional | yes | `Boolean` |

## Signature

```fs
$playerDestroy[guildId;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | no | no | The guild id to destroy the player for |
| 2 | `reason` | `String` | no | no | The reason to destroy the player for |

### Per-parameter notes

- **`guildId`** (`Guild`, optional): The guild id to destroy the player for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`reason`** (`String`, optional): The reason to destroy the player for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$playerDestroy` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerDestroy[123456789012345678]
```

**Full form (all arguments)**

```fs
$playerDestroy[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/natives/player/playerDestroy.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
      if (!linked) return this.customError('ForgeLinked is not initialized')
      if (!guildId) guildId = ctx.guild
      if (!guildId)
        return this.customError(
          'Unable to find any guild. Ensure this command was ran inside of a guild and not DMs or a group chat',
        )
      const player = linked.getPlayer(guildId.id)
      if (!player) return this.customError('Player not found')
      await player.destroy(reason || undefined)
      return this.success(true)
    } catch (err) {
      return this.customError(
        `Failed to destroy player: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`guildId`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerConnectedVC`]($playerConnectedVC.md)
- [`$playerCreate`]($playerCreate.md)
- [`$playerExists`]($playerExists.md)
- [`$playerJoinVC`]($playerJoinVC.md)
- [`$playerMoveVC`]($playerMoveVC.md)
- [`$playerReconnect`]($playerReconnect.md)
- [`$playerTextID`]($playerTextID.md)

**Source:** [`src/natives/player/playerDestroy.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/player/playerDestroy.ts)
