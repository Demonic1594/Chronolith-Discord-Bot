# $channelThreadIDs

> Returns the thread ids of a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.5.0 | optional | yes | `Channel[]` |

## Signature

```fs
$channelThreadIDs[channel ID;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to get its threads |
| 2 | `separator` | `String` | no | no | The separator to use for every thread |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to get its threads. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`separator`** (`String`, optional): The separator to use for every thread. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelThreadIDs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelThreadIDs[123456789012345678]
```

**Full form (all arguments)**

```fs
$channelThreadIDs[123456789012345678;,]
```

## Reference implementation (source)

Taken from `src/native/channel/channelThreadIDs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const chan = channel ?? ctx.channel
        return this.success("threads" in chan ? (chan.threads as ThreadManager).cache.map((x) => x.id).join(sep ?? ", ") : null)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/channelThreadIDs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/channelThreadIDs.ts)
