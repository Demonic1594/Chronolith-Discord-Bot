# $loadImage

> Loads an image from an URL, File path, SVG, or other data

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.1.0 | required | yes | — |

> aliases: $createImage, $newImage

## Signature

```fs
$loadImage[name;src]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The image name |
| 2 | `src` | `String` | **yes** | no | The image source |

### Per-parameter notes

- **`name`** (`String`, required): The image name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`src`** (`String`, required): The image source. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$loadImage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadImage[name;value]
```

## Reference implementation (source)

Taken from `src/functions/image/loadImage.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!(ctx.imageManager instanceof ImageManager))
            ctx.imageManager = new ImageManager();

        const img = await resolveImage(this, ctx, src);
        if (img instanceof Return) return img;

        ctx.imageManager.map.set(name, img);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createImage`, `$newImage` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachImage`]($attachImage.md)
- [`$deleteImage`]($deleteImage.md)
- [`$imageBuffer`]($imageBuffer.md)
- [`$imageSize`]($imageSize.md)
- [`$imageSmoothing`]($imageSmoothing.md)
- [`$loadImageOptions`]($loadImageOptions.md)
- [`$preloadImage`]($preloadImage.md)

**Source:** [`src/functions/image/loadImage.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/loadImage.ts)
