# $stickerID

> Returns the sticker id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `sticker` | v1.4.0 | none | no | `Sticker` |

## Signature

```fs
$stickerID
```

## How it works

Sticker functions read and manage guild stickers.

`$stickerID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$stickerID
```

## Reference implementation (source)

Taken from `src/native/sticker/stickerID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.sticker?.id)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
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

**Source:** [`src/native/sticker/stickerID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/sticker/stickerID.ts)
