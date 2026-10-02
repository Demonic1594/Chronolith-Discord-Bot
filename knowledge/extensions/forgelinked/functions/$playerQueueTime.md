# $playerQueueTime

> Get the total queue time of a player, optionally excluding specific sources.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `queue` | v1.1.0 | optional | yes | `Number` |

## Signature

```fs
$playerQueueTime[guildId;exclude]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | no | no | The guild ID to get the queue time for. |
| 2 | `exclude` | `String` | no | yes | Sources to exclude from the queue time (e.g. "youtube", "soundcloud"). |

### Per-parameter notes

- **`guildId`** (`Guild`, optional): The guild ID to get the queue time for.. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`exclude`** (`String` , rest, optional): Sources to exclude from the queue time (e.g. "youtube", "soundcloud").. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$playerQueueTime` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `exclude` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$playerQueueTime[123456789012345678]
```

**Full form (all arguments)**

```fs
$playerQueueTime[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/natives/queue/playerQueueTime.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
    if (!linked) return this.customError('ForgeLinked is not initialized')

    if (!guildId) guildId = ctx.guild
    if (!guildId)
      return this.customError(
        'Unable to find any guild. Ensure this command was ran inside of a guild and not DMs or a group chat.',
      )

    const player = linked.getPlayer(guildId.id)
    if (!player) return this.customError('Player not found')

    // Only count what's left to be heard: the current track + upcoming queue.
    // Including previous tracks would make the total grow as more songs play,
    // which is the opposite of what callers expect from a "remaining time" value.
    const allTracks = [
      ...(player.queue.current ? [player.queue.current] : []),
      ...(player.queue.tracks ?? []),
    ]

    // Normalize exclusions (convert to lowercase, split by commas or semicolons)
    const excludeList = (exclude ?? [])
      .flatMap((e) => e.split(/[;,]+/))
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)

    // Calculate total duration excluding the given sources
    const total = allTracks
      .filter((track) => {
        const source = track.info.sourceName?.toLowerCase() || ''
        return !excludeList.includes(source)
      })
      .reduce((acc, track) => acc + (track.info.duration || 0), 0)

    return this.success(total)
  },
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`guildId`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerAddTrack`]($playerAddTrack.md)
- [`$playerClearQueue`]($playerClearQueue.md)
- [`$playerNextTrack`]($playerNextTrack.md)
- [`$playerPrevious`]($playerPrevious.md)
- [`$playerPreviousExists`]($playerPreviousExists.md)
- [`$playerPreviousTrack`]($playerPreviousTrack.md)
- [`$playerQueue`]($playerQueue.md)
- [`$playerQueueHistory`]($playerQueueHistory.md)

**Source:** [`src/natives/queue/playerQueueTime.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/queue/playerQueueTime.ts)
