# $getApplicationEmojis

> Gets all application emojis

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.5.0 | optional | yes | `Json`, `Unknown[]` |

## Signature

```fs
$getApplicationEmojis[property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `property` | `Enum` | no | no | The property to return for every emoji |
| 2 | `separator` | `String` | no | no | The separator to use for every emoji property |

### Per-parameter notes

- **`property`** (`Enum`, optional): The property to return for every emoji. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for every emoji property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$getApplicationEmojis` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getApplicationEmojis[value]
```

**Full form (all arguments)**

```fs
$getApplicationEmojis[value;,]
```

## Reference implementation (source)

Taken from `src/native/emoji/getApplicationEmojis.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const emojis = await ctx.fetchApplicationEmojis(true)
        if (!prop) return this.successJSON(emojis)
        return this.success(emojis ? emojis.map(emoji => ApplicationEmojiProperties[prop](emoji)).join(sep ?? ", ") : null)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`property`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/emoji/getApplicationEmojis.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/getApplicationEmojis.ts)
