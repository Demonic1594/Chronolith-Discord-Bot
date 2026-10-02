# $emojiAnimated

> Returns whether the emoji is animated

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.0.0 | optional | yes | `Boolean` |

## Signature

```fs
$emojiAnimated[emoji ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `emoji ID` | `Emoji` | **yes** | no | The emoji to return its animation state |

### Per-parameter notes

- **`emoji ID`** (`Emoji`, required): The emoji to return its animation state. Expects an emoji. Accepts a raw emoji ID, a `<:name:id>` / `<a:name:id>` string, or a `cdn.discordapp.com/emojis/<id>` URL. Searched in guild emojis, then application emojis.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$emojiAnimated` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$emojiAnimated[:smile:]
```

## Reference implementation (source)

Taken from `src/native/emoji/emojiAnimated.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success((emoji ?? ctx.emoji)?.animated)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addApplicationEmoji`]($addApplicationEmoji.md)
- [`$addEmoji`]($addEmoji.md)
- [`$deleteApplicationEmojis`]($deleteApplicationEmojis.md)
- [`$deleteEmojiMessageReactions`]($deleteEmojiMessageReactions.md)
- [`$deleteEmojis`]($deleteEmojis.md)
- [`$editApplicationEmoji`]($editApplicationEmoji.md)
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)

**Source:** [`src/native/emoji/emojiAnimated.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/emojiAnimated.ts)
