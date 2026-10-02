# $editApplicationEmoji

> Edits an application emoji, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.5.0 | required | yes | `Boolean` |

## Signature

```fs
$editApplicationEmoji[emoji ID;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `emoji ID` | `ApplicationEmoji` | **yes** | no | The emoji to edit |
| 2 | `name` | `String` | **yes** | no | The new name for the emoji |

### Per-parameter notes

- **`emoji ID`** (`ApplicationEmoji`, required): The emoji to edit. Expects an application emoji. Same resolution as Emoji but only application (global bot) emojis are searched.
- **`name`** (`String`, required): The new name for the emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$editApplicationEmoji` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editApplicationEmoji[:smile:;name]
```

## Reference implementation (source)

Taken from `src/native/emoji/editApplicationEmoji.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await emoji.edit({ name: name }).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addApplicationEmoji`]($addApplicationEmoji.md)
- [`$addEmoji`]($addEmoji.md)
- [`$deleteApplicationEmojis`]($deleteApplicationEmojis.md)
- [`$deleteEmojiMessageReactions`]($deleteEmojiMessageReactions.md)
- [`$deleteEmojis`]($deleteEmojis.md)
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)
- [`$emojiAnimated`]($emojiAnimated.md)

**Source:** [`src/native/emoji/editApplicationEmoji.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/editApplicationEmoji.ts)
