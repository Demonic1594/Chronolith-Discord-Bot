# $editEmoji

> Edits an emoji of a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$editEmoji[guild ID;emoji ID;name;reason;roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to edit this emoji on |
| 2 | `emoji ID` | `GuildEmoji` | **yes** | no | The emoji to edit |
| 3 | `name` | `String` | no | no | The new name for the emoji |
| 4 | `reason` | `String` | no | no | The reason for editing the emoji |
| 5 | `roles` | `Role` | no | yes | The new roles to limit usage of this emoji to |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to edit this emoji on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`emoji ID`** (`GuildEmoji`, required): The emoji to edit. Expects a guild emoji. Same resolution as Emoji but only guild emojis are searched.
- **`name`** (`String`, optional): The new name for the emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`reason`** (`String`, optional): The reason for editing the emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`roles`** (`Role` , rest, optional): The new roles to limit usage of this emoji to. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$editEmoji` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$editEmoji[123456789012345678;:smile:]
```

**Full form (all arguments)**

```fs
$editEmoji[123456789012345678;:smile:;name;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/emoji/editEmoji.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            !!(await emoji
                .edit({
                    name: name || undefined,
                    reason: reason || ctx.reason,
                    roles: roles || undefined,
                })
                .catch(ctx.noop)
            )
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addApplicationEmoji`]($addApplicationEmoji.md)
- [`$addEmoji`]($addEmoji.md)
- [`$deleteApplicationEmojis`]($deleteApplicationEmojis.md)
- [`$deleteEmojiMessageReactions`]($deleteEmojiMessageReactions.md)
- [`$deleteEmojis`]($deleteEmojis.md)
- [`$editApplicationEmoji`]($editApplicationEmoji.md)
- [`$emoji`]($emoji.md)
- [`$emojiAnimated`]($emojiAnimated.md)

**Source:** [`src/native/emoji/editEmoji.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/editEmoji.ts)
