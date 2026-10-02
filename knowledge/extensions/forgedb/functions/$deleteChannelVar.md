# $deleteChannelVar

> Removes a value from a variable associated with a channel.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `channel` | v2.0.0 | required | yes | — |

## Signature

```fs
$deleteChannelVar[name;channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable. |
| 2 | `channel ID` | `Channel` | no | no | The unique identifier of the value to delete. |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`channel ID`** (`Channel`, optional): The unique identifier of the value to delete.. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$deleteChannelVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteChannelVar[name]
```

**Full form (all arguments)**

```fs
$deleteChannelVar[name;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/channel/deleteChannelVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.delete({ name, id: channel?.id ?? ctx.channel!.id, type: "channel", guildId: (channel as BaseGuildTextChannel)?.guild.id ?? ctx.guild?.id })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`channel ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelLeaderboard`]($channelLeaderboard.md)
- [`$getChannelLeaderboardID`]($getChannelLeaderboardID.md)
- [`$getChannelLeaderboardLength`]($getChannelLeaderboardLength.md)
- [`$getChannelLeaderboardValue`]($getChannelLeaderboardValue.md)
- [`$getChannelVar`]($getChannelVar.md)
- [`$setChannelVar`]($setChannelVar.md)

**Source:** [`src/functions/channel/deleteChannelVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/channel/deleteChannelVar.ts)
