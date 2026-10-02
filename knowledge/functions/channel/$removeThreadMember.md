# $removeThreadMember

> Removes a member from a thread, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$removeThreadMember[guild ID;channel ID;user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to pull member from |
| 2 | `channel ID` | `Channel` | **yes** | no | The thread to remove member from |
| 3 | `user ID` | `Member` | **yes** | no | The member to remove |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to pull member from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`channel ID`** (`Channel`, required): The thread to remove member from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`user ID`** (`Member`, required): The member to remove. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$removeThreadMember` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$removeThreadMember[123456789012345678;123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/channel/removeThreadMember.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const thread = channel as ThreadChannel
        const success = await thread.members.remove(member.id).catch(ctx.noop)

        return this.success(!!success)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addChannelPerms`]($addChannelPerms.md)
- [`$addPermissionOverwrite`]($addPermissionOverwrite.md)
- [`$addPostTags`]($addPostTags.md)
- [`$addThreadMember`]($addThreadMember.md)
- [`$archiveThread`]($archiveThread.md)
- [`$channelBitrate`]($channelBitrate.md)
- [`$channelCategoryID`]($channelCategoryID.md)
- [`$channelChildrenCount`]($channelChildrenCount.md)

**Source:** [`src/native/channel/removeThreadMember.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/removeThreadMember.ts)
