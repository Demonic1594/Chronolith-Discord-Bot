# $deleteEmojis

> Deletes given emojis from a guild, returns the count of emotes deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `emoji` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$deleteEmojis[guild ID;emojis]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to delete emotes from |
| 2 | `emojis` | `GuildEmoji` | **yes** | yes | The emojis to delete |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to delete emotes from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`emojis`** (`GuildEmoji` , rest, required): The emojis to delete. Expects a guild emoji. Same resolution as Emoji but only guild emojis are searched.

## How it works

Emoji functions read and manage guild/application emojis — creation, edits, deletion, listings, and per-emoji properties.

`$deleteEmojis` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `emojis` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteEmojis[123456789012345678;:smile:]
```

## Reference implementation (source)

Taken from `src/native/emoji/deleteEmojis.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let count = 0
        for (let i = 0, len = emotes.length; i < len; i++) {
            const emote = emotes[i]
            const success = await emote.delete(ctx.reason).catch(ctx.noop)
            if (success) count++
        }

        return this.success(count)
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
- [`$editApplicationEmoji`]($editApplicationEmoji.md)
- [`$editEmoji`]($editEmoji.md)
- [`$emoji`]($emoji.md)
- [`$emojiAnimated`]($emojiAnimated.md)

**Source:** [`src/native/emoji/deleteEmojis.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/emoji/deleteEmojis.ts)
