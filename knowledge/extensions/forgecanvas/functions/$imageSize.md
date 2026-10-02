# $imageSize

> Returns the image's size

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.1.0 | required | yes | — |

> aliases: $imgSize, $imageDimensions

## Signature

```fs
$imageSize[path;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `path` | `String` | **yes** | no | The image path or name (via images://name or, preload://name, if global) |
| 2 | `property` | `Enum` | no | no | Whether to return the image's width or height; Returns both as JSON if empty |

### Per-parameter notes

- **`path`** (`String`, required): The image path or name (via images://name or, preload://name, if global). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`property`** (`Enum`, optional): Whether to return the image's width or height; Returns both as JSON if empty. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$imageSize` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$imageSize[value]
```

**Full form (all arguments)**

```fs
$imageSize[value;value]
```

## Reference implementation (source)

Taken from `src/functions/image/imageSize.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        let image: Image | undefined;

        if (path.startsWith('images://')) {
            path = path.slice(9);

            let manager = ctx.imageManager;
            if (path.startsWith('preload://')) {
                path = path.slice(10);
                manager = ctx.client.preloadImages;
            }

            image = manager?.get(path);
        } else if (path.startsWith('preload://'))
            image = ctx.client.preloadImages.get(path);
        else image = await ctx.imageManager?.load(path);
        if (!image) return this.customError(ForgeCanvasError.ImageFail);

        return this.success(property !== null && property !== undefined // @ts-ignore
            ? image[WidthOrHeight[
                (typeof property === 'string' ? WidthOrHeight[property] : property) as any
            ]]
            : JSON.stringify({ width: image.width, height: image.height })
        );
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$imgSize`, `$imageDimensions` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachImage`]($attachImage.md)
- [`$deleteImage`]($deleteImage.md)
- [`$imageBuffer`]($imageBuffer.md)
- [`$imageSmoothing`]($imageSmoothing.md)
- [`$loadImage`]($loadImage.md)
- [`$loadImageOptions`]($loadImageOptions.md)
- [`$preloadImage`]($preloadImage.md)

**Source:** [`src/functions/image/imageSize.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/imageSize.ts)
