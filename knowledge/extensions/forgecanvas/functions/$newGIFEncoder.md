# $newGIFEncoder

> Creates a new GIF Encoder

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | no | — |

> aliases: $createGIFEncoder, $GIFEncoder, $createEncoder, $newEncoder

## Signature

```fs
$newGIFEncoder[gif;width;height;palette;functions]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `gif` | `String` | **yes** | no | Name of the new GIF Encoder |
| 2 | `width` | `Number` | **yes** | no | Width of the new canvas |
| 3 | `height` | `Number` | **yes** | no | Height of the new canvas |
| 4 | `palette` | `Json` | no | no | Palette for the GIF |
| 5 | `functions` | `Unknown` | no | yes | Functions |

### Per-parameter notes

- **`gif`** (`String`, required): Name of the new GIF Encoder. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`width`** (`Number`, required): Width of the new canvas. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`height`** (`Number`, required): Height of the new canvas. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`palette`** (`Json`, optional): Palette for the GIF. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`functions`** (`Unknown` , rest, optional): Functions. Expects anything. Kept as the raw resolved string.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

See the function list below for exact signatures.

`$newGIFEncoder` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `functions` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$newGIFEncoder[value;5;5]
```

**Full form (all arguments)**

```fs
$newGIFEncoder[value;5;5;{"key":"value"};value]
```

## Reference implementation (source)

Taken from `src/functions/gif/newGIFEncoder.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!this.data.fields) this.data.fields = [];
        const manager = ctx.gifManager instanceof GIFManager ?
            ctx.gifManager : ctx.gifManager = new GIFManager();

        const options = await this['resolveMultipleArgs'](ctx, 0,1,2,3);
        let [name, width, height, palette] = options.args;

        const r = options.return;
        if (!r?.success) return r;

        try { palette = JSON.parse(palette) } catch(_){};
        
        const previous = manager.currentEncoder;
        manager.currentEncoder = new Encoder(
            width, height,
            Array.isArray(palette)
                ? Uint8Array.from(palette)
                : undefined
        );

        for (let i = 4; i < this.data.fields.length; i++) {
            const r = await this['resolveCode'](ctx, this.data.fields[i]);
            if (!r?.success) return r;
        }

        manager.setEncoder(name, manager.currentEncoder);
        manager.currentEncoder = previous;

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createGIFEncoder`, `$GIFEncoder`, `$createEncoder`, `$newEncoder` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Optional arguments (`palette`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)

**Source:** [`src/functions/gif/newGIFEncoder.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/newGIFEncoder.ts)
