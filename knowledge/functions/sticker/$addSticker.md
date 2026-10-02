# $addSticker

> Adds a sticker to a guild, returns sticker id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `sticker` | v1.0.0 | required | yes | `Sticker` |

## Signature

```fs
$addSticker[guild ID;url;name;tags;description]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to add the sticker to |
| 2 | `url` | `String` | **yes** | no | The url or file path for this sticker |
| 3 | `name` | `String` | **yes** | no | The sticker name |
| 4 | `tags` | `String` | **yes** | no | The tags to use for this sticker |
| 5 | `description` | `String` | no | no | The description for the sticker |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to add the sticker to. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`url`** (`String`, required): The url or file path for this sticker. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): The sticker name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`tags`** (`String`, required): The tags to use for this sticker. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The description for the sticker. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Sticker functions read and manage guild stickers.

`$addSticker` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addSticker[123456789012345678;https://example.com;name;value]
```

**Full form (all arguments)**

```fs
$addSticker[123456789012345678;https://example.com;name;value;value]
```

## Reference implementation (source)

Taken from `src/native/sticker/addSticker.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const created = await guild.stickers
            .create({
                file: url,
                name,
                tags,
                description: desc || null,
                reason: ctx.reason
            })
            .catch(ctx.noop)
        return this.success(created?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`description`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteStickers`]($deleteStickers.md)
- [`$editSticker`]($editSticker.md)
- [`$setStickerDescription`]($setStickerDescription.md)
- [`$setStickerName`]($setStickerName.md)
- [`$setStickerTags`]($setStickerTags.md)
- [`$stickerAvailable`]($stickerAvailable.md)
- [`$stickerCreatedAt`]($stickerCreatedAt.md)
- [`$stickerDescription`]($stickerDescription.md)

**Source:** [`src/native/sticker/addSticker.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/sticker/addSticker.ts)
