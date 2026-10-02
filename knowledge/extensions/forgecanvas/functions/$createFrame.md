# $createFrame

> Creates a new GIF Frame

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $createGIFFrame, $newFrame, $newGIFFrame

## Signature

```fs
$createFrame[frame;src;options;speed]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `frame` | `String` | **yes** | no | Name of the new GIF Frame |
| 2 | `src` | `String` | **yes** | no | Source of the GIF Frame |
| 3 | `options` | `Json` | no | no | Options for the GIF Frame |
| 4 | `speed` | `Number` | no | no | Frame rgb quantization speed |

### Per-parameter notes

- **`frame`** (`String`, required): Name of the new GIF Frame. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`src`** (`String`, required): Source of the GIF Frame. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`options`** (`Json`, optional): Options for the GIF Frame. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
- **`speed`** (`Number`, optional): Frame rgb quantization speed. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$createFrame` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createFrame[value;value]
```

**Full form (all arguments)**

```fs
$createFrame[value;value;{"key":"value"};5]
```

## Reference implementation (source)

Taken from `src/functions/gif/createFrame.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const manager = ctx.gifManager instanceof GIFManager ?
            ctx.gifManager : ctx.gifManager = new GIFManager();
        
        const f = await resolveFrame(this, ctx, frame, speed);
        if (f instanceof Return) return f;

        if (options) {
            if (typeof options.delay === 'number') f.delay = options.delay;

            // @ts-ignore
            if (options.dispose && DisposalMethod[options.dispose])
                f.dispose = options.dispose as DisposalMethod;

            if (typeof options.transparent === 'number')
                f.transparent = options.transparent;

            if (typeof options.needsUserInput === 'boolean')
                f.needsUserInput = options.needsUserInput;

            if (typeof options.top === 'number') f.top = options.top;
            if (typeof options.left === 'number') f.left = options.left;

            if (typeof options.interlaced === 'boolean') f.interlaced = options.interlaced;

            if (Array.isArray(options.palette)) f.setPalette(Uint8Array.from(options.palette));
        };

        manager.setFrame(name, f);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createGIFFrame`, `$newFrame`, `$newGIFFrame` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`options`, `speed`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)
- [`$deleteFrame`]($deleteFrame.md)

**Source:** [`src/functions/gif/createFrame.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/createFrame.ts)
