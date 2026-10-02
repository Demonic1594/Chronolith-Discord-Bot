# $playerMoveVC

> Move the player to a different voice channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `player` | v2.1.0 | required | yes | `Boolean` |

## Signature

```fs
$playerMoveVC[guildId;newVoiceChannelId]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to move the player for |
| 2 | `newVoiceChannelId` | `Channel` | **yes** | no | The ID of the voice channel to move to |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to move the player for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`newVoiceChannelId`** (`Channel`, required): The ID of the voice channel to move to. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

See the function list below for exact signatures.

`$playerMoveVC` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerMoveVC[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/natives/player/playerMoveVC.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
      if (!linked) return this.customError('ForgeLinked is not initialized')
      const player = linked.getPlayer(guildId.id)
      if (!player) return this.customError('Player not found')
      await player.changeVoiceState({ voiceChannelId: newVoiceChannelId.id })
      return this.success(true)
    } catch (err) {
      return this.customError(
        `Failed to move voice channel: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerConnectedVC`]($playerConnectedVC.md)
- [`$playerCreate`]($playerCreate.md)
- [`$playerDestroy`]($playerDestroy.md)
- [`$playerExists`]($playerExists.md)
- [`$playerJoinVC`]($playerJoinVC.md)
- [`$playerReconnect`]($playerReconnect.md)
- [`$playerTextID`]($playerTextID.md)

**Source:** [`src/natives/player/playerMoveVC.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/player/playerMoveVC.ts)
