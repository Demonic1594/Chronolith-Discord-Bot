# $addPostTags

> Adds tags to a forum post, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$addPostTags[channel ID;reason;tags]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The post to edit tags on |
| 2 | `reason` | `String` | no | no | The reason for adding post tags |
| 3 | `tags` | `String` | **yes** | yes | The tags for the post |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The post to edit tags on. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`reason`** (`String`, optional): The reason for adding post tags. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`tags`** (`String` , rest, required): The tags for the post. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$addPostTags` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `tags` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addPostTags[123456789012345678;value]
```

**Full form (all arguments)**

```fs
$addPostTags[123456789012345678;value;value]
```

## Reference implementation (source)

Taken from `src/native/channel/addPostTags.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const post = channel as ThreadChannel
        return this.success(!!(await post.setAppliedTags([...post.appliedTags, ...tags], reason || ctx.reason).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)
- [`$channelChildrenIDs`]($channelChildrenIDs.md)

**Source:** [`src/native/channel/addPostTags.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/addPostTags.ts)
