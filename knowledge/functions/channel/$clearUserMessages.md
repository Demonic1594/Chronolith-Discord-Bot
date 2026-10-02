# $clearUserMessages

> Clears x amount of messages from a channel of given user, returns the number of messages deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$clearUserMessages[channel ID;user ID;amount;delete pinned]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to clear messages on |
| 2 | `user ID` | `User` | **yes** | no | The user to delete their messages |
| 3 | `amount` | `Number` | **yes** | no | The amount of messages to delete |
| 4 | `delete pinned` | `Boolean` | no | no | Whether to delete pinned messages |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to clear messages on. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`user ID`** (`User`, required): The user to delete their messages. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.
- **`amount`** (`Number`, required): The amount of messages to delete. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`delete pinned`** (`Boolean`, optional): Whether to delete pinned messages. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$clearUserMessages` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$clearUserMessages[123456789012345678;123456789012345678;5]
```

**Full form (all arguments)**

```fs
$clearUserMessages[123456789012345678;123456789012345678;5;true]
```

## Reference implementation (source)

Taken from `src/native/channel/clearUserMessages.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let count = 0

        for (const n of splitNumber(amount, 100)) {
            const messages = await (channel as TextChannel).messages.fetch({ limit: n }).catch(ctx.noop)
            if (!messages) break

            const col = await (channel as TextChannel)
                .bulkDelete(
                    messages.filter(msg => {
                        if (pinned === false && msg.pinned) return false
                        return !!(msg.author.id === user.id)
                    }),
                    true
                )
                .catch(() => null)

            if (!col) break

            count += col.size
        }

        return this.success(count)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`delete pinned`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/clearUserMessages.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/clearUserMessages.ts)
