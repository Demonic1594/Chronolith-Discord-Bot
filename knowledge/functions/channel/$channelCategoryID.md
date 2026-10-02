# $channelCategoryID

> Returns the channel category id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.0 | optional | yes | `Channel` |

> aliases: $channelParentID

## Signature

```fs
$channelCategoryID[channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The id of the channel |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The id of the channel. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelCategoryID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelCategoryID[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/channel/channelCategoryID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const chan = ch ?? ctx.channel
        return this.success(chan && "parentId" in chan ? chan.parentId : undefined)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$channelParentID` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
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
- [`$channelChildrenCount`]($channelChildrenCount.md)
- [`$channelChildrenIDs`]($channelChildrenIDs.md)

**Source:** [`src/native/channel/channelCategoryID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/channelCategoryID.ts)
