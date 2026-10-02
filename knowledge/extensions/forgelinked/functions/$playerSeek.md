# $playerSeek

> Seek a player

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `control` | v2.1.0 | optional | yes | `Boolean` |

## Signature

```fs
$playerSeek[guildId;position]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to seek the player for |
| 2 | `position` | `Number` | **yes** | no | The position to seek the player to |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to seek the player for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`position`** (`Number`, required): The position to seek the player to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$playerSeek` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerSeek[123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/natives/control/playerSeek.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
      if (!linked) return this.customError('ForgeLinked is not initialized')
      const player = linked.getPlayer(guildId.id)
      if (!player) return this.customError('Player not found')
      if (!player.node?.connected)
        return this.customError(
          'Lavalink node is not connected. Please wait for the node to reconnect.',
        )
      if (position < 0) return this.customError('Position must be 0 or greater')
      await player.seek(position)
      return this.success(true)
    } catch (err) {
      return this.customError(
        `Failed to seek player: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerElapsedTime`]($playerElapsedTime.md)
- [`$playerGetVolume`]($playerGetVolume.md)
- [`$playerIsPaused`]($playerIsPaused.md)
- [`$playerLoopStatus`]($playerLoopStatus.md)
- [`$playerPause`]($playerPause.md)
- [`$playerReplay`]($playerReplay.md)
- [`$playerResume`]($playerResume.md)
- [`$playerSetVolume`]($playerSetVolume.md)

**Source:** [`src/natives/control/playerSeek.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/control/playerSeek.ts)
