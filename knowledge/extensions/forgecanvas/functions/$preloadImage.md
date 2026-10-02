# $preloadImage

> Loads an image globally; Recommended for images that never change. Use preload://name to draw

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.3.0 | required | yes | — |

## Signature

```fs
$preloadImage[name;src]
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

`$preloadImage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$preloadImage[name;value]
```

## Reference implementation (source)

Taken from `src/functions/image/preloadImage.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const img = await resolveImage(this, ctx, src);
        if (img instanceof Return) return img;

        ctx.client.preloadImages.set(name, img);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachImage`]($attachImage.md)
- [`$deleteImage`]($deleteImage.md)
- [`$imageBuffer`]($imageBuffer.md)
- [`$imageSize`]($imageSize.md)
- [`$imageSmoothing`]($imageSmoothing.md)
- [`$loadImage`]($loadImage.md)
- [`$loadImageOptions`]($loadImageOptions.md)

**Source:** [`src/functions/image/preloadImage.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/preloadImage.ts)
