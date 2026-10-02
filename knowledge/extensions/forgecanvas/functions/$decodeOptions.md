# $decodeOptions

> Creates new GIF Decode Options

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $decoderOptions

## Signature

```fs
$decodeOptions[name;options]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the new GIF Decode Options |
| 2 | `options` | `Unknown` | no | yes | The Options |

### Per-parameter notes

- **`name`** (`String`, required): Name of the new GIF Decode Options. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`options`** (`Unknown` , rest, optional): The Options. Expects anything. Kept as the raw resolved string.

## How it works

See the function list below for exact signatures.

`$decodeOptions` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `options` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$decodeOptions[name]
```

**Full form (all arguments)**

```fs
$decodeOptions[name;value]
```

## Reference implementation (source)

Taken from `src/functions/gif/decodeOptions.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const manager = ctx.gifManager instanceof GIFManager ?
            ctx.gifManager : ctx.gifManager = new GIFManager();

        if (manager.currentOptions) {
            manager.setDecodeOptions(name, manager.currentOptions);
            manager.currentOptions = undefined;
        } else manager.setDecodeOptions(name, new DecodeOptions());

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$decoderOptions` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addFrame`]($addFrame.md)
- [`$checkLZWEndCode`]($checkLZWEndCode.md)
- [`$attachGIF`]($attachGIF.md)
- [`$checkFrameConsistency`]($checkFrameConsistency.md)
- [`$createFrame`]($createFrame.md)
- [`$deleteDecoder`]($deleteDecoder.md)
- [`$deleteEncoder`]($deleteEncoder.md)
- [`$deleteFrame`]($deleteFrame.md)

**Source:** [`src/functions/gif/decodeOptions.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/decodeOptions.ts)
