# $deleteImage

> Deletes the image

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.2.0 | required | yes | — |

> aliases: $removeImage

## Signature

```fs
$deleteImage[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the image |

### Per-parameter notes

- **`name`** (`String`, required): Name of the image. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$deleteImage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteImage[name]
```

## Reference implementation (source)

Taken from `src/functions/image/deleteImage.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        let manager = ctx.imageManager;
        if (name.startsWith('preload://')) {
            name = name.slice(10);
            manager = ctx.client.preloadImages;
        }

        manager?.remove(name);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$removeImage` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachImage`]($attachImage.md)
- [`$imageBuffer`]($imageBuffer.md)
- [`$imageSize`]($imageSize.md)
- [`$imageSmoothing`]($imageSmoothing.md)
- [`$loadImage`]($loadImage.md)
- [`$loadImageOptions`]($loadImageOptions.md)
- [`$preloadImage`]($preloadImage.md)

**Source:** [`src/functions/image/deleteImage.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/deleteImage.ts)
