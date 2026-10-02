# $isRoleMentioned

> Returns whether a role was mentioned in this message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.3.0 | required | yes | `Boolean` |

## Signature

```fs
$isRoleMentioned[channel ID;message ID;role ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | Channel to pull the message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to get mentions from |
| 3 | `role ID` | `String` | **yes** | no | The entity to check for mentions |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): Channel to pull the message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to get mentions from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`role ID`** (`String`, required): The entity to check for mentions. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$isRoleMentioned` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isRoleMentioned[123456789012345678;123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/mention/isRoleMentioned.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(message.mentions.roles.has(r))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$disableAllMentions`]($disableAllMentions.md)
- [`$disableEveryoneMention`]($disableEveryoneMention.md)
- [`$disableRoleMentions`]($disableRoleMentions.md)
- [`$disableUserMentions`]($disableUserMentions.md)
- [`$enableAllMentions`]($enableAllMentions.md)
- [`$enableRoleMentions`]($enableRoleMentions.md)
- [`$enableUserMentions`]($enableUserMentions.md)
- [`$isChannelMentioned`]($isChannelMentioned.md)

**Source:** [`src/native/mention/isRoleMentioned.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/isRoleMentioned.ts)
