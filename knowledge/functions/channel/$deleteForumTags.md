# $deleteForumTags

> Deletes tags from a forum, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.5.0 | required | yes | `Boolean` |

> aliases: $deleteForumTag

## Signature

```fs
$deleteForumTags[channel ID;tags]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The forum to delete tags from |
| 2 | `tags` | `ForumTag` | **yes** | yes | The tags to delete |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The forum to delete tags from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`tags`** (`ForumTag` , rest, required): The tags to delete. Expects a forum tag ID. Looked up in the available tags of the pointer channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$deleteForumTags` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `tags` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteForumTags[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/channel/deleteForumTags.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const forum = channel as ThreadOnlyChannel
        const newTags = forum.availableTags.filter((x) => !tags.some((tag) => x.id === tag.id))
        return this.success(!!(await forum.setAvailableTags(newTags).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteForumTag` — function names are case-insensitive.
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

**Source:** [`src/native/channel/deleteForumTags.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/deleteForumTags.ts)
