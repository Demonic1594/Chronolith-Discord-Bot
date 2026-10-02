# $deleteStickers

> Deletes given stickers, returns the count of stickers deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `sticker` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$deleteStickers[guild ID;stickers]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to delete stickers from |
| 2 | `stickers` | `String` | **yes** | yes | The stickers to delete |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to delete stickers from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`stickers`** (`String` , rest, required): The stickers to delete. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Sticker functions read and manage guild stickers.

`$deleteStickers` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `stickers` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$deleteStickers[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/sticker/deleteStickers.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let count = 0
        for (let i = 0, len = stickers.length; i < len; i++) {
            const sticker = stickers[i]
            const success = await g.stickers.delete(sticker, ctx.reason).then(x => true).catch(ctx.noop)
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

- [`$addSticker`]($addSticker.md)
- [`$editSticker`]($editSticker.md)
- [`$setStickerDescription`]($setStickerDescription.md)
- [`$setStickerName`]($setStickerName.md)
- [`$setStickerTags`]($setStickerTags.md)
- [`$stickerAvailable`]($stickerAvailable.md)
- [`$stickerCreatedAt`]($stickerCreatedAt.md)
- [`$stickerDescription`]($stickerDescription.md)

**Source:** [`src/native/sticker/deleteStickers.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/sticker/deleteStickers.ts)
