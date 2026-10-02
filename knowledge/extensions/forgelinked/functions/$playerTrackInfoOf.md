# $playerTrackInfoOf

> Get the info of a track

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `track` | v1.0.0 | required | yes | `Json` |

## Signature

```fs
$playerTrackInfoOf[guildId;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to get the track info for |
| 2 | `index` | `Number` | **yes** | no | The index of the track to get the info for |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to get the track info for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`index`** (`Number`, required): The index of the track to get the info for. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$playerTrackInfoOf` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerTrackInfoOf[123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/natives/track/playerTrackInfoOf.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
    if (!linked) return this.customError('ForgeLinked is not initialized')
    const player = linked.getPlayer(guildId.id)
    if (!player) return this.customError('Player not found')
    if (index < 0 || index >= player.queue.tracks.length)
      return this.customError(
        `Index out of bounds — queue has ${player.queue.tracks.length} track(s)`,
      )
    return this.successJSON(player.queue.tracks[index])
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerCurrentLyrics`]($playerCurrentLyrics.md)
- [`$playerCurrentTrack`]($playerCurrentTrack.md)
- [`$playerSearchTrack`]($playerSearchTrack.md)
- [`$playerTrackDuration`]($playerTrackDuration.md)
- [`$playerTrackRequester`]($playerTrackRequester.md)
- [`$playerTrackThumbnail`]($playerTrackThumbnail.md)

**Source:** [`src/natives/track/playerTrackInfoOf.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/track/playerTrackInfoOf.ts)
