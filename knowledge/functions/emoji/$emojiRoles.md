# $emojiRoles

> Returns the role ids that can use this emote

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.0.0 | optional | yes | `Role[]` |

## Signature

```fs
$emojiRoles[emoji ID;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `emoji ID` | `GuildEmoji` | **yes** | no | The emoji to return its roles |
| 2 | `separator` | `String` | no | no | The separator to use for every role |

### Per-parameter notes

- **`emoji ID`** (`GuildEmoji`, required): The emoji to return its roles. Expects a guild emoji. Same resolution as Emoji but only guild emojis are searched.
- **`separator`** (`String`, optional): The separator to use for every role. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$emojiRoles` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$emojiRoles[:smile:]
```

**Full form (all arguments)**

```fs
$emojiRoles[:smile:;,]
```

## Reference implementation (source)

Taken from `src/native/emoji/emojiRoles.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const emoji = em ?? ctx.emoji
        return this.success(emoji && "roles" in emoji ? emoji.roles.cache.map((x) => x.id).join(sep || ", ") : undefined)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)

**Source:** [`src/native/emoji/emojiRoles.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/emojiRoles.ts)
