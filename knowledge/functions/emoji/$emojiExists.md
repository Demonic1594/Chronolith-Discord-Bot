# $emojiExists

> Returns whether an emoji id exists

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$emojiExists[emoji ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `emoji ID` | `String` | **yes** | no | The emoji id to check |

### Per-parameter notes

- **`emoji ID`** (`String`, required): The emoji id to check. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$emojiExists` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$emojiExists[:smile:]
```

## Reference implementation (source)

Taken from `src/native/emoji/emojiExists.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(CompiledFunction.IdRegex.test(id) && (ctx.client.emojis.cache.has(id) || (await ctx.client.application.emojis.fetch(id).catch(() => false)) !== false))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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

**Source:** [`src/native/emoji/emojiExists.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/emojiExists.ts)
