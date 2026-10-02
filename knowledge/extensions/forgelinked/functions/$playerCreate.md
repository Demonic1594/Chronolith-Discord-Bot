# $playerCreate

> Create a player for a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `player` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$playerCreate[guildId;voiceID;textID;volume;selfDeaf;selfMute;node]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | **yes** | no | The guild id to create the player for |
| 2 | `voiceID` | `Channel` | **yes** | no | The ID of the voice channel for the bot to use |
| 3 | `textID` | `Channel` | no | no | The ID of the text channel for the bot to use |
| 4 | `volume` | `Number` | no | no | The volume to set the player to |
| 5 | `selfDeaf` | `Boolean` | no | no | Whether to deafen the bot |
| 6 | `selfMute` | `Boolean` | no | no | Whether to mute the bot |
| 7 | `node` | `String` | no | no | The node to use for the player |

### Per-parameter notes

- **`guildId`** (`Guild`, required): The guild id to create the player for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`voiceID`** (`Channel`, required): The ID of the voice channel for the bot to use. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`textID`** (`Channel`, optional): The ID of the text channel for the bot to use. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`volume`** (`Number`, optional): The volume to set the player to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`selfDeaf`** (`Boolean`, optional): Whether to deafen the bot. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`selfMute`** (`Boolean`, optional): Whether to mute the bot. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`node`** (`String`, optional): The node to use for the player. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$playerCreate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerCreate[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$playerCreate[123456789012345678;123456789012345678;123456789012345678;5;true;true;value]
```

## Reference implementation (source)

Taken from `src/natives/player/playerCreate.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
      if (!linked) return this.customError('ForgeLinked is not initialized')

      const connectedNodes = Array.from(linked.nodeManager.nodes.values()).filter(
        (n: any) => n.connected,
      )
      if (!connectedNodes.length)
        return this.customError(
          'No Lavalink nodes are connected. Please wait for a node to connect.',
        )

      linked.createPlayer({
        guildId: guildId.id,
        voiceChannelId: voiceId.id,
        textChannelId: textId?.id || ctx.channel?.id,
        volume: volume || 100,
        selfDeaf: selfDeaf ?? true,
        selfMute: selfMute || false,
        node: node || undefined,
      })
      return this.success(linked.players.has(guildId.id))
    } catch (err) {
      return this.customError(
        `Failed to create player: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`textID`, `volume`, `selfDeaf`, `selfMute`, `node`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerConnectedVC`]($playerConnectedVC.md)
- [`$playerDestroy`]($playerDestroy.md)
- [`$playerExists`]($playerExists.md)
- [`$playerJoinVC`]($playerJoinVC.md)
- [`$playerMoveVC`]($playerMoveVC.md)
- [`$playerReconnect`]($playerReconnect.md)
- [`$playerTextID`]($playerTextID.md)

**Source:** [`src/natives/player/playerCreate.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/player/playerCreate.ts)
