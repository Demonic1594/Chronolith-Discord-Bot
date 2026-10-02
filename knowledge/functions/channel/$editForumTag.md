# $editForumTag

> Edits an existing forum tag, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.5.0 | required | yes | `Boolean` |

## Signature

```fs
$editForumTag[channel ID;tag ID;name;emoji;moderated]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The forum to edit tag on |
| 2 | `tag ID` | `ForumTag` | **yes** | no | The tag to edit |
| 3 | `name` | `String` | no | no | The new name for the tag |
| 4 | `emoji` | `String` | no | no | The new emoji for the tag |
| 5 | `moderated` | `Boolean` | no | no | Whether the tag can only be applied by mods |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The forum to edit tag on. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`tag ID`** (`ForumTag`, required): The tag to edit. Expects a forum tag ID. Looked up in the available tags of the pointer channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`name`** (`String`, optional): The new name for the tag. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`emoji`** (`String`, optional): The new emoji for the tag. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`moderated`** (`Boolean`, optional): Whether the tag can only be applied by mods. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$editForumTag` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editForumTag[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editForumTag[123456789012345678;123456789012345678;name;:smile:;true]
```

## Reference implementation (source)

Taken from `src/native/channel/editForumTag.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const forum = channel as ThreadOnlyChannel
        const tags = forum.availableTags
        const index = tags.findIndex((x) => x.id === tag.id)

        if (name) tag.name = name
        if (emoji !== null) tag.emoji = parseSingleEmoji(ctx, emoji)
        if (typeof mod === "boolean") tag.moderated = mod

        tags[index] = tag
        return this.success(!!(await forum.setAvailableTags(tags).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `emoji`, `moderated`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/editForumTag.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/editForumTag.ts)
