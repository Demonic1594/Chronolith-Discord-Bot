# $playerAddTrack

> Add a track to a player

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `queue` | v1.0.0 | required | yes | `Json` |

## Signature

```fs
$playerAddTrack[guildId;query;source]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to add the track to |
| 2 | `query` | `String` | **yes** | no | The query to search for |
| 3 | `source` | `String` | no | no | The source to use |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to add the track to. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`query`** (`String`, required): The query to search for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`source`** (`String`, optional): The source to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$playerAddTrack` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerAddTrack[123456789012345678;query]
```

**Full form (all arguments)**

```fs
$playerAddTrack[123456789012345678;query;value]
```

## Reference implementation (source)

Taken from `src/natives/queue/playerAddTrack.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const extension = ctx.client.getExtension(ForgeLinked, true)
      if (!extension) return this.customError('ForgeLinked extension not found')

      const lavalink = extension.lavalink
      let player = lavalink.getPlayer(guildId.id)

      if (!player) return this.customError('Player not found for this guild.')
      if (!player.connected) {
        try {
          await player.connect()
        } catch (connErr) {
          return this.customError(
            `Failed to connect to voice: ${connErr instanceof Error ? connErr.message : 'Unknown error'}`,
          )
        }
      }
      const platform = (source || 'ytsearch') as SearchPlatform
      const result = await player.search({ query, source: platform }, ctx.member).catch(() => null)

      if (!result || !result.tracks.length || result.loadType === 'empty') {
        return this.customError('No results found for the provided query.')
      }

      if (result.loadType === 'error') {
        return this.customError('An error occurred while fetching the track.')
      }
      if (result.loadType === 'playlist') {
        player.queue.add(result.tracks)
      } else {
        player.queue.add(result.tracks[0])
      }

      if (!player.playing && !player.paused) {
        await player.play().catch((e: Error) => this.customError(e.message))
      }

      const requester = result.tracks[0].requester as User

      return this.successJSON({
        status: 'success',
        type: result.loadType,
        message:
          result.loadType === 'playlist'
            ? `Queued ${result.tracks.length} tracks from ${result.playlist?.title}`
            : `Queued ${result.tracks[0].info.title}`,
        playlistName: result.loadType === 'playlist' ? result.playlist?.title : null,
        playlistUri: result.loadType === 'playlist' ? result.playlist?.uri : null,
        trackCount: result.loadType === 'playlist' ? result.tracks.length : 1,
        trackTitle: result.loadType !== 'playlist' ? result.tracks[0].info.title : null,
        trackAuthor: result.loadType !== 'playlist' ? result.tracks[0].info.author : null,
        trackUri: result.loadType !== 'playlist' ? result.tracks[0].info.uri : null,
        trackImage: result.tracks[0].info.artworkUrl,
        requester: requester?.id || 'Unknown',
      })
    } catch (error: any) {
      return this.customError(`Internal Error: ${error.message ?? 'Unknown'}`)
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`source`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerClearQueue`]($playerClearQueue.md)
- [`$playerNextTrack`]($playerNextTrack.md)
- [`$playerPrevious`]($playerPrevious.md)
- [`$playerPreviousExists`]($playerPreviousExists.md)
- [`$playerPreviousTrack`]($playerPreviousTrack.md)
- [`$playerQueue`]($playerQueue.md)
- [`$playerQueueHistory`]($playerQueueHistory.md)
- [`$playerQueueLength`]($playerQueueLength.md)

**Source:** [`src/natives/queue/playerAddTrack.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/queue/playerAddTrack.ts)
