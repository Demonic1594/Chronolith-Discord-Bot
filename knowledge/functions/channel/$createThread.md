# $createThread

> Creates a thread, returns thread channel id on success

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.3 | required | yes | `Channel` |

## Signature

```fs
$createThread[channel ID;name;message ID;private;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | no | no | The channel to create the thread at |
| 2 | `name` | `String` | **yes** | no | The name for the thread |
| 3 | `message ID` | `Message` | no | no | The message to start thread for |
| 4 | `private` | `Boolean` | no | no | Whether this thread is private |
| 5 | `reason` | `String` | no | no | The reason for creating thread |

### Per-parameter notes

- **`channel ID`** (`Channel`, optional): The channel to create the thread at. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`name`** (`String`, required): The name for the thread. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`message ID`** (`Message`, optional): The message to start thread for. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`private`** (`Boolean`, optional): Whether this thread is private. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`reason`** (`String`, optional): The reason for creating thread. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$createThread` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createThread[123456789012345678]
```

**Full form (all arguments)**

```fs
$createThread[123456789012345678;name;123456789012345678;true;value]
```

## Reference implementation (source)

Taken from `src/native/channel/createThread.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ch = channel as TextChannel

        const success = await ch.threads
            .create({
                name,
                startMessage: m || undefined,
                reason: reason || ctx.reason,
                type: priv ? ChannelType.PrivateThread : ChannelType.PublicThread
            })
            .catch(ctx.noop)

        return this.success(success ? success.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`channel ID`, `message ID`, `private`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/createThread.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/createThread.ts)
