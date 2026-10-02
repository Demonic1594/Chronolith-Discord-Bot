# $playerStop

> Stops playback without destroying the player

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `control` | v2.1.0 | required | yes | `Boolean` |

## Signature

```fs
$playerStop[guildId;clearQueue]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to stop the player for |
| 2 | `clearQueue` | `Boolean` | **yes** | no | Whether to clear the queue |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to stop the player for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`clearQueue`** (`Boolean`, required): Whether to clear the queue. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$playerStop` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerStop[123456789012345678;true]
```

## Reference implementation (source)

Taken from `src/natives/control/playerStop.ts` in the `ForgeLinked` repository — this is exactly what runs:

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
      await player.stopPlaying(clearQueue)
      return this.success(true)
    } catch (err) {
      return this.customError(
        `Failed to stop player: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerElapsedTime`]($playerElapsedTime.md)
- [`$playerGetVolume`]($playerGetVolume.md)
- [`$playerIsPaused`]($playerIsPaused.md)
- [`$playerLoopStatus`]($playerLoopStatus.md)
- [`$playerPause`]($playerPause.md)
- [`$playerReplay`]($playerReplay.md)
- [`$playerResume`]($playerResume.md)
- [`$playerSeek`]($playerSeek.md)

**Source:** [`src/natives/control/playerStop.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/control/playerStop.ts)
