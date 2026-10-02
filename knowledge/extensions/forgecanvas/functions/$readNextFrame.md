# $readNextFrame

> Reads and saves the next frame (including the buffer) of the GIF Decoder into an env

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

## Signature

```fs
$readNextFrame[gif;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `gif` | `String` | **yes** | no | Name of the Decoder |
| 2 | `name` | `String` | **yes** | no | Name of the env to save the frame info |

### Per-parameter notes

- **`gif`** (`String`, required): Name of the Decoder. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): Name of the env to save the frame info. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$readNextFrame` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$readNextFrame[value;name]
```

## Reference implementation (source)

Taken from `src/functions/gif/readNextFrame.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const gif = ctx.gifManager?.getDecoder(name);
        if (!gif) return this.customError(ForgeCanvasError.NoDecoder);

        const frame = gif.readNextFrame();
        if (frame) {
            ctx.gifManager?.setFrame(f, frame);
            return this.success(f);
        }

        ctx.gifManager?.removeFrame(f);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)

**Source:** [`src/functions/gif/readNextFrame.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/readNextFrame.ts)
