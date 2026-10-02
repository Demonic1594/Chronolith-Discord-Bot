# $addEmoji

> Adds an emoji to a guild, returns the emoji id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.0.7 | required | yes | `GuildEmoji` |

## Signature

```fs
$addEmoji[guild ID;name;url;return emoji ID;roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to add this emote to |
| 2 | `name` | `String` | **yes** | no | The name for the emoji |
| 3 | `url` | `String` | **yes** | no | The emoji icon to use |
| 4 | `return emoji ID` | `Boolean` | no | no | Whether to return the emoji id |
| 5 | `roles` | `Role` | no | yes | The roles to limit usage of this emote |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to add this emote to. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String`, required): The name for the emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`url`** (`String`, required): The emoji icon to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return emoji ID`** (`Boolean`, optional): Whether to return the emoji id. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`roles`** (`Role` , rest, optional): The roles to limit usage of this emote. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$addEmoji` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addEmoji[123456789012345678;name;https://example.com]
```

**Full form (all arguments)**

```fs
$addEmoji[123456789012345678;name;https://example.com;true;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/emoji/addEmoji.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const em = await guild.emojis
            .create({
                attachment: icon,
                name,
                roles: roles || undefined,
                reason: ctx.reason
            })
            .catch(ctx.noop)

        return this.success(returnEmojiID && em ? em.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`return emoji ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addApplicationEmoji`]($addApplicationEmoji.md)
- [`$deleteApplicationEmojis`]($deleteApplicationEmojis.md)
- [`$deleteEmojiMessageReactions`]($deleteEmojiMessageReactions.md)
- [`$deleteEmojis`]($deleteEmojis.md)
- [`$editApplicationEmoji`]($editApplicationEmoji.md)
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)
- [`$emojiAnimated`]($emojiAnimated.md)

**Source:** [`src/native/emoji/addEmoji.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/addEmoji.ts)
