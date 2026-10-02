# $loadImageOptions

> Sets or returns the current load image options; Applies to $drawImage and other

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `image` | v1.3.0 | optional | yes | — |

## Signature

```fs
$loadImageOptions[global;alt;maxRedirects;requestOptions]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `global` | `Boolean` | no | no | If true, touches global Image Manager instead |
| 2 | `alt` | `String` | no | no | Sets the alt text of the next images |
| 3 | `maxRedirects` | `Number` | no | no | Sets the limit of redirects the loader allows during fetching; Unlimited if none provided |
| 4 | `requestOptions` | `Json` | no | no | Sets the loader's fetch options |

### Per-parameter notes

- **`global`** (`Boolean`, optional): If true, touches global Image Manager instead. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`alt`** (`String`, optional): Sets the alt text of the next images. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`maxRedirects`** (`Number`, optional): Sets the limit of redirects the loader allows during fetching; Unlimited if none provided. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`requestOptions`** (`Json`, optional): Sets the loader's fetch options. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

See the function list below for exact signatures.

`$loadImageOptions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadImageOptions[true]
```

**Full form (all arguments)**

```fs
$loadImageOptions[true;value;5;{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/functions/image/loadImageOptions.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const manager = !g ? (ctx.imageManager instanceof ImageManager ?
                ctx.imageManager : ctx.imageManager = new ImageManager())
            : ctx.client.preloadImages;

        if (!alt && !max && !opts) return this.successJSON(manager.loadOptions ?? {});

        const options: LoadImageOptions = {};

        if (alt?.trim().length) options.alt = alt;
        if (typeof max === 'number')
            options.maxRedirects = max;
        if (Object.keys(opts ?? {}).length)
            options.requestOptions = opts as any;

        if (Object.keys(options).length)
            manager.loadOptions = options;
        else delete manager.loadOptions;

        return this.success();
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`global`, `alt`, `maxRedirects`, `requestOptions`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$attachImage`]($attachImage.md)
- [`$deleteImage`]($deleteImage.md)
- [`$imageBuffer`]($imageBuffer.md)
- [`$imageSize`]($imageSize.md)
- [`$imageSmoothing`]($imageSmoothing.md)
- [`$loadImage`]($loadImage.md)
- [`$preloadImage`]($preloadImage.md)

**Source:** [`src/functions/image/loadImageOptions.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/image/loadImageOptions.ts)
