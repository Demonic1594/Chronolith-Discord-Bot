# $GIFDecoderOption

> Sets or returns a GIF Frame option

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $decoderOption, $GIFDecoderProperty, $decoderProperty

## Signature

```fs
$GIFDecoderOption[gif;option]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `gif` | `String` | **yes** | no | Name of the Decoder |
| 2 | `option` | `Enum` | **yes** | no | Option to get |

### Per-parameter notes

- **`gif`** (`String`, required): Name of the Decoder. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`option`** (`Enum`, required): Option to get. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$GIFDecoderOption` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$GIFDecoderOption[value;value]
```

## Reference implementation (source)

Taken from `src/functions/gif/GIFDecoderOption.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const gif = ctx.gifManager?.getDecoder(name);
        if (!gif) return this.customError(ForgeCanvasError.NoDecoder);

        const opt = gif?.[
            (typeof option === 'number'
                ? DecoderOption[option] : option
            ) as unknown as keyof Decoder
        ];

        if (opt instanceof Uint8ClampedArray || opt instanceof ArrayBuffer) {
            if (opt instanceof Uint8ClampedArray)
                return this.success(`[${Array.from(opt).join(', ')}]`);
            
            return this.success(`[${Array.from(new Uint8Array(opt)).join(', ')}]`);
        };
        
        return this.success(opt);
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$decoderOption`, `$GIFDecoderProperty`, `$decoderProperty` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)

**Source:** [`src/functions/gif/GIFDecoderOption.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/GIFDecoderOption.ts)
