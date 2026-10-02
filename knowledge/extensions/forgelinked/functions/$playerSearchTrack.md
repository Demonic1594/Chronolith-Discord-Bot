# $playerSearchTrack

> Search for a track

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `track` | v1.0.0 | required | yes | `Json` |

## Signature

```fs
$playerSearchTrack[guildId;query;source;requester;limit]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to search for the track in |
| 2 | `query` | `String` | **yes** | no | The query to search for |
| 3 | `source` | `String` | no | no | The source to use. Such as yt for youtube ytm for youtube music etc. Depends on the lavalink server config |
| 4 | `requester` | `Member` | no | no | The requester of the track |
| 5 | `limit` | `Number` | no | no | The limit of the tracks to return |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to search for the track in. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`query`** (`String`, required): The query to search for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`source`** (`String`, optional): The source to use. Such as yt for youtube ytm for youtube music etc. Depends on the lavalink server config. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`requester`** (`Member`, optional): The requester of the track. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`limit`** (`Number`, optional): The limit of the tracks to return. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$playerSearchTrack` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerSearchTrack[123456789012345678;query]
```

**Full form (all arguments)**

```fs
$playerSearchTrack[123456789012345678;query;value;123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/natives/track/playerSearchTrack.ts` in the `ForgeLinked` repository — this is exactly what runs:

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

      let supported: string[] = []
      try {
        const info = await player.node.fetchInfo()
        supported = info?.sourceManagers || []
      } catch {
        // If fetchInfo fails, skip source validation and proceed
      }

      let finalQuery = query

      if (source) {
        if (supported.length && !supported.includes(source)) {
          return this.customError(`Source '${source}' not supported by the Lavalink server`)
        }
        finalQuery = `${source}:${query}`
      }

      const result = await player
        .search(finalQuery, {
          requester: requester?.id ?? ctx.member?.id,
        })
        .catch((err: unknown) => {
          throw new Error(err instanceof Error ? err.message : String(err))
        })

      if (!result || !result.tracks.length) return this.customError('No results found!')

      let tracks = result.tracks
      if (limit) tracks = tracks.slice(0, limit)

      return this.successJSON({
        status: 'success',
        source,
        type: result.loadType,
        message:
          result.loadType === 'playlist'
            ? `Found ${tracks.length} tracks from ${result.playlist?.name}`
            : `Found ${tracks.length} tracks matching the query.`,
        playlistName: result.loadType === 'playlist' ? result.playlist?.name : null,
        playlistUri: result.loadType === 'playlist' ? result.playlist?.uri : null,
        playlistDuration: result.loadType === 'playlist' ? result.playlist?.duration : null,
        requester: result.tracks[0]?.requester ?? null,
        trackCount: tracks.length,
        tracks: tracks.map((track) => ({
          title: track.info.title,
          author: track.info.author,
          duration: track.info.duration,
          url: track.info.uri,
          thumbnail: track.info.artworkUrl,
          source,
        })),
      })
    } catch (err) {
      return this.customError(`Search failed: ${err instanceof Error ? err.message : String(err)}`)
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`source`, `requester`, `limit`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerCurrentLyrics`]($playerCurrentLyrics.md)
- [`$playerCurrentTrack`]($playerCurrentTrack.md)
- [`$playerTrackDuration`]($playerTrackDuration.md)
- [`$playerTrackInfoOf`]($playerTrackInfoOf.md)
- [`$playerTrackRequester`]($playerTrackRequester.md)
- [`$playerTrackThumbnail`]($playerTrackThumbnail.md)

**Source:** [`src/natives/track/playerSearchTrack.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/track/playerSearchTrack.ts)
