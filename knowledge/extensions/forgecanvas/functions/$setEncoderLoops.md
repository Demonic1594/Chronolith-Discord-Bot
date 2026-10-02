# $setEncoderLoops

> Sets the number of loops for the GIF Encoder

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $setEncoderRepeat, $setGIFEncoderRepeat, $setGIFEncoderLoops, $setLoops, $setRepeat

## Signature

```fs
$setEncoderLoops[gif;loops]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `gif` | `String` | no | no | Name of the GIF |
| 2 | `loops` | `Number` | **yes** | no | Number of loops |

### Per-parameter notes

- **`gif`** (`String`, optional): Name of the GIF. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`loops`** (`Number`, required): Number of loops. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$setEncoderLoops` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setEncoderLoops[value]
```

**Full form (all arguments)**

```fs
$setEncoderLoops[value;5]
```

## Reference implementation (source)

Taken from `src/functions/gif/setEncoderLoops.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const gif = ctx.gifManager?.getEncoderOrCurrent(name);
        if (!gif) return this.customError(ForgeCanvasError.NoEncoder);

        gif.setRepeat(loops);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setEncoderRepeat`, `$setGIFEncoderRepeat`, `$setGIFEncoderLoops`, `$setLoops`, `$setRepeat` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`gif`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)

**Source:** [`src/functions/gif/setEncoderLoops.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/setEncoderLoops.ts)
