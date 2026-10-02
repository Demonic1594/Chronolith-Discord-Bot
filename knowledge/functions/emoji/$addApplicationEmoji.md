# $addApplicationEmoji

> Adds an application emoji, returns the emoji id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.5.0 | required | yes | `ApplicationEmoji` |

## Signature

```fs
$addApplicationEmoji[name;url;return emoji ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name for the emoji |
| 2 | `url` | `String` | **yes** | no | The emoji icon to use |
| 3 | `return emoji ID` | `Boolean` | no | no | Whether to return the emoji id |

### Per-parameter notes

- **`name`** (`String`, required): The name for the emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`url`** (`String`, required): The emoji icon to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return emoji ID`** (`Boolean`, optional): Whether to return the emoji id. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$addApplicationEmoji` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addApplicationEmoji[name;https://example.com]
```

**Full form (all arguments)**

```fs
$addApplicationEmoji[name;https://example.com;true]
```

## Reference implementation (source)

Taken from `src/native/emoji/addApplicationEmoji.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        returnEmojiID ??= true
        const emoji = await ctx.client.application.emojis.create({
            name: name,
            attachment: icon
        }).catch(ctx.noop)

        return this.success(returnEmojiID && emoji ? emoji.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`return emoji ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addEmoji`]($addEmoji.md)
- [`$deleteApplicationEmojis`]($deleteApplicationEmojis.md)
- [`$deleteEmojiMessageReactions`]($deleteEmojiMessageReactions.md)
- [`$deleteEmojis`]($deleteEmojis.md)
- [`$editApplicationEmoji`]($editApplicationEmoji.md)
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)
- [`$emojiAnimated`]($emojiAnimated.md)

**Source:** [`src/native/emoji/addApplicationEmoji.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/addApplicationEmoji.ts)
