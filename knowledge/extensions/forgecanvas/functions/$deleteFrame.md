# $deleteFrame

> Deletes the frame

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $removeFrame

## Signature

```fs
$deleteFrame[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the frame |

### Per-parameter notes

- **`name`** (`String`, required): Name of the frame. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$deleteFrame` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteFrame[name]
```

## Reference implementation (source)

Taken from `src/functions/gif/deleteFrame.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.gifManager?.removeFrame(name);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$removeFrame` — function names are case-insensitive.
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

**Source:** [`src/functions/gif/deleteFrame.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/deleteFrame.ts)
