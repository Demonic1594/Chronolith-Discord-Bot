# $addFrame

> Adds a frame to the GIF

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

## Signature

```fs
$addFrame[gif;frame;options;speed]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `gif` | `String` | no | no | Name of the GIF |
| 2 | `frame` | `String` | **yes** | no | Frame source |
| 3 | `options` | `Json` | no | no | Frame options |
| 4 | `speed` | `Number` | no | no | Frame rgb quantization speed |

### Per-parameter notes

- **`gif`** (`String`, optional): Name of the GIF. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`frame`** (`String`, required): Frame source. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`options`** (`Json`, optional): Frame options. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
- **`speed`** (`Number`, optional): Frame rgb quantization speed. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$addFrame` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addFrame[value]
```

**Full form (all arguments)**

```fs
$addFrame[value;value;{"key":"value"};5]
```

## Reference implementation (source)

Taken from `src/functions/gif/addFrame.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const gif = ctx.gifManager?.getEncoderOrCurrent(name);
        if (!gif) return this.customError(ForgeCanvasError.NoEncoder);

        const f = await resolveFrame(this, ctx, frame, speed);
        if (f instanceof Return) return f;

        if (options) {
            if (typeof options.delay === 'number') f.delay = options.delay;

            // @ts-expect-error
            if (options.dispose && DisposalMethod[options.dispose])
                f.dispose = options.dispose as DisposalMethod;

            if (typeof options.transparent === 'number')
                f.transparent = options.transparent;

            if (typeof options.needsUserInput === 'boolean')
                f.needsUserInput = options.needsUserInput;

            if (typeof options.top === 'number')
                f.top = options.top;
            if (typeof options.left === 'number')
                f.left = options.left;

            if (typeof options.interlaced === 'boolean')
                f.interlaced = options.interlaced;

            if (Array.isArray(options.palette))
                f.setPalette(Uint8Array.from(options.palette));
        }

        gif.addFrame(f);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`gif`, `options`, `speed`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)
- [`$deleteFrame`]($deleteFrame.md)

**Source:** [`src/functions/gif/addFrame.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/addFrame.ts)
