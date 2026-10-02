# $attachGIF

> Attaches the GIF

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $sendGIF, $renderGIF, $gifRender

## Signature

```fs
$attachGIF[gif;filename]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `gif` | `String` | **yes** | no | Name of the GIF |
| 2 | `filename` | `String` | no | no | The name of the GIF to be attached as |

### Per-parameter notes

- **`gif`** (`String`, required): Name of the GIF. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`filename`** (`String`, optional): The name of the GIF to be attached as. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$attachGIF` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$attachGIF[value]
```

**Full form (all arguments)**

```fs
$attachGIF[value;name]
```

## Reference implementation (source)

Taken from `src/functions/gif/attachGif.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const gif = ctx.gifManager?.getEncoder(name);
        filename = `${filename ?? name}.gif`;
        
        if (!gif) return this.customError(ForgeCanvasError.NoEncoder);

        ctx.container.files.push(new AttachmentBuilder(
            Buffer.from(gif.getBuffer()),
            { name: filename }
        ));
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$sendGIF`, `$renderGIF`, `$gifRender` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`filename`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$decodeOptions`]($decodeOptions.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)
- [`$deleteFrame`]($deleteFrame.md)

**Source:** [`src/functions/gif/attachGif.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/attachGif.ts)
