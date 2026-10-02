# $getForumTag

> Returns the tag of a forum

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v2.7.0 | required | yes | `Json`, `Unknown` |

## Signature

```fs
$getForumTag[channel ID;tag ID;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The forum to pull tags from |
| 2 | `tag ID` | `ForumTag` | **yes** | no | The tag to retrieve |
| 3 | `property` | `Enum` | no | no | The property of the tag to return |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The forum to pull tags from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`tag ID`** (`ForumTag`, required): The tag to retrieve. Expects a forum tag ID. Looked up in the available tags of the pointer channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`property`** (`Enum`, optional): The property of the tag to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$getForumTag` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getForumTag[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$getForumTag[123456789012345678;123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/channel/getForumTag.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (prop) return this.success(ForumTagProperties[prop](tag))
        return this.successJSON(tag)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
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

**Source:** [`src/native/channel/getForumTag.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/getForumTag.ts)
