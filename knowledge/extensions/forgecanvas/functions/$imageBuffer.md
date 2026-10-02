# $imageBuffer

> Stores the image's buffer which can be accessed with $env

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.2.0 | required | yes | — |

## Signature

```fs
$imageBuffer[variable name;path]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable name` | `String` | **yes** | no | The variable to load it to, accessed with $env[name] |
| 2 | `path` | `String` | **yes** | no | The image path |

### Per-parameter notes

- **`variable name`** (`String`, required): The variable to load it to, accessed with $env[name]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`path`** (`String`, required): The image path. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$imageBuffer` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$imageBuffer[name;value]
```

## Reference implementation (source)

Taken from `src/functions/image/imageBuffer.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        let image: Image | undefined

        if (path.startsWith('images://')) {
            path = path.slice(9);

            let manager = ctx.imageManager;
            if (path.startsWith('preload://')) {
                path = path.slice(10);
                manager = ctx.client.preloadImages;
            }

            image = manager?.get(path);
        } else image = await ctx.imageManager?.load(path);
        if (!image) return this.customError(ForgeCanvasError.NoImage);

        ctx.setEnvironmentKey(vname, Buffer.from(image.src));
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
- [`$imageSize`]($imageSize.md)
- [`$imageSmoothing`]($imageSmoothing.md)
- [`$loadImage`]($loadImage.md)
- [`$loadImageOptions`]($loadImageOptions.md)
- [`$preloadImage`]($preloadImage.md)

**Source:** [`src/functions/image/imageBuffer.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/imageBuffer.ts)
