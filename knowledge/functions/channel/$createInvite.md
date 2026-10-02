# $createInvite

> Creates an invite, returns the invite code

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `channel` | v1.1.0 | required | yes | `Invite` |

## Signature

```fs
$createInvite[channel ID;max uses;max age;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to make the invite for |
| 2 | `max uses` | `Number` | no | no | The max amount of uses for this invite |
| 3 | `max age` | `Number` | no | no | The max age for this invite |
| 4 | `reason` | `String` | no | no | The reason for creating this invite |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to make the invite for. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`max uses`** (`Number`, optional): The max amount of uses for this invite. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max age`** (`Number`, optional): The max age for this invite. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`reason`** (`String`, optional): The reason for creating this invite. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$createInvite` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createInvite[123456789012345678]
```

**Full form (all arguments)**

```fs
$createInvite[123456789012345678;5;5;value]
```

## Reference implementation (source)

Taken from `src/native/channel/createInvite.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const channel = (ch ?? ctx.channel) as TextChannel
        const invite = await channel
            .createInvite({
                reason: reason || ctx.reason,
                maxUses: maxUses || undefined,
                maxAge: typeof(maxAge) === "number" ? maxAge : undefined,
                unique: true
            })
            .catch(ctx.noop)
        return this.success(invite ? invite.code : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`max uses`, `max age`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/channel/createInvite.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/channel/createInvite.ts)
