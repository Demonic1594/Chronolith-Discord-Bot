# $stickerOwnerID

> Returns the user who added the sticker

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `sticker` | v1.4.0 | optional | yes | `User` |

## Signature

```fs
$stickerOwnerID[sticker ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `sticker ID` | `Sticker` | **yes** | no | The sticker to pull owner of |

### Per-parameter notes

- **`sticker ID`** (`Sticker`, required): The sticker to pull owner of. Expects a sticker ID or CDN URL. Fetched via `client.fetchSticker`.

## How it works

Sticker functions read and manage guild stickers.

`$stickerOwnerID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$stickerOwnerID[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/sticker/stickerOwnerID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        s ??= ctx.sticker!
        return this.success(await s?.fetchUser().then(x => x?.id).catch(ctx.noop))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addSticker`]($addSticker.md)
- [`$deleteStickers`]($deleteStickers.md)
- [`$editSticker`]($editSticker.md)
- [`$setStickerDescription`]($setStickerDescription.md)
- [`$setStickerName`]($setStickerName.md)
- [`$setStickerTags`]($setStickerTags.md)
- [`$stickerAvailable`]($stickerAvailable.md)
- [`$stickerCreatedAt`]($stickerCreatedAt.md)

**Source:** [`src/native/sticker/stickerOwnerID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/sticker/stickerOwnerID.ts)
