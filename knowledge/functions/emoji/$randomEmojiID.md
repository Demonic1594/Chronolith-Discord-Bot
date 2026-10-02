# $randomEmojiID

> Returns a random emoji ID

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.0.3 | none | no | `GuildEmoji` |

## Signature

```fs
$randomEmojiID
```

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$randomEmojiID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$randomEmojiID
```

## Reference implementation (source)

Taken from `src/native/emoji/randomEmojiID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.client.emojis.cache.randomKey())
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addApplicationEmoji`]($addApplicationEmoji.md)
- [`$addEmoji`]($addEmoji.md)
- [`$deleteApplicationEmojis`]($deleteApplicationEmojis.md)
- [`$deleteEmojiMessageReactions`]($deleteEmojiMessageReactions.md)
- [`$deleteEmojis`]($deleteEmojis.md)
- [`$editApplicationEmoji`]($editApplicationEmoji.md)
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)

**Source:** [`src/native/emoji/randomEmojiID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/randomEmojiID.ts)
