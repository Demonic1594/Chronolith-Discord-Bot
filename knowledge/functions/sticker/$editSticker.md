# $editSticker

> Edits a sticker on a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `sticker` | v1.4.0 | required | yes | `Boolean` |

## Signature

```fs
$editSticker[sticker ID;name;description;tags]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `sticker ID` | `Sticker` | **yes** | no | The sticker to edit |
| 2 | `name` | `String` | no | no | The new name for the sticker |
| 3 | `description` | `String` | no | no | The new description for the sticker |
| 4 | `tags` | `String` | no | yes | The new tags for the sticker |

### Per-parameter notes

- **`sticker ID`** (`Sticker`, required): The sticker to edit. Expects a sticker ID or CDN URL. Fetched via `client.fetchSticker`.
- **`name`** (`String`, optional): The new name for the sticker. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The new description for the sticker. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`tags`** (`String` , rest, optional): The new tags for the sticker. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Sticker functions read and manage guild stickers.

`$editSticker` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `tags` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$editSticker[123456789012345678]
```

**Full form (all arguments)**

```fs
$editSticker[123456789012345678;name;value;value]
```

## Reference implementation (source)

Taken from `src/native/sticker/editSticker.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            !!(await s.edit({
                name: name || undefined,
                description: desc || undefined,
                tags: tags.join(" ") || undefined,
                reason: ctx.reason
            }).catch(ctx.noop))
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`, `description`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addSticker`]($addSticker.md)
- [`$deleteStickers`]($deleteStickers.md)
- [`$setStickerDescription`]($setStickerDescription.md)
- [`$setStickerName`]($setStickerName.md)
- [`$setStickerTags`]($setStickerTags.md)
- [`$stickerAvailable`]($stickerAvailable.md)
- [`$stickerCreatedAt`]($stickerCreatedAt.md)
- [`$stickerDescription`]($stickerDescription.md)

**Source:** [`src/native/sticker/editSticker.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/sticker/editSticker.ts)
