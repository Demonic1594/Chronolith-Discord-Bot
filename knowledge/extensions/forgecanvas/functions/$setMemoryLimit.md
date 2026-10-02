# $setMemoryLimit

> Configure the memory limit for the GIF Decoder

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gif` | v1.2.0 | required | yes | — |

> aliases: $setRAMLimit

## Signature

```fs
$setMemoryLimit[name;limit]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | no | no | Name of the Decode Options |
| 2 | `limit` | `Number` | **yes** | no | Memory limit in bytes |

### Per-parameter notes

- **`name`** (`String`, optional): Name of the Decode Options. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`limit`** (`Number`, required): Memory limit in bytes. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$setMemoryLimit` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setMemoryLimit[name]
```

**Full form (all arguments)**

```fs
$setMemoryLimit[name;5]
```

## Reference implementation (source)

Taken from `src/functions/gif/setMemoryLimit.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const manager = ctx.gifManager instanceof GIFManager ?
            ctx.gifManager : ctx.gifManager = new GIFManager();
        if (!name && !manager.currentOptions)
            manager.currentOptions = new DecodeOptions();

        const options = name
            ? manager.getDecodeOptions(name)
            : manager.currentOptions;

        if (options) options.setMemoryLimit(limit);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setRAMLimit` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/functions/gif/setMemoryLimit.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gif/setMemoryLimit.ts)
