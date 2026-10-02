# $channelIsChildrenOf

> Checks whether given channel is a children of a category

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.5.0 | required | yes | `Boolean` |

> aliases: $isChildrenOf

## Signature

```fs
$channelIsChildrenOf[channel ID;category ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to know if is children of category |
| 2 | `category ID` | `Channel` | **yes** | no | The category to check against |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to know if is children of category. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`category ID`** (`Channel`, required): The category to check against. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelIsChildrenOf` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelIsChildrenOf[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/channel/channelIsChildrenOf.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((cat as CategoryChannel).children.cache.has(ch.id))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$isChildrenOf` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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

**Source:** [`src/native/channel/channelIsChildrenOf.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/channelIsChildrenOf.ts)
