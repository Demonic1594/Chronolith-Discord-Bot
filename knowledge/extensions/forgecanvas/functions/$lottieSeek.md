# $lottieSeek

> Seeks to a specific position/frame/time in a lottie animation

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `lottie` | v1.3.0 | required | yes | — |

> aliases: $lottieTo

## Signature

```fs
$lottieSeek[lottie;type;position]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `lottie` | `String` | **yes** | no | Name of the lottie animation |
| 2 | `type` | `Enum` | **yes** | no | Type of position used to seek |
| 3 | `position` | `Number` | **yes** | no | The position/frame/time to seek to |

### Per-parameter notes

- **`lottie`** (`String`, required): Name of the lottie animation. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): Type of position used to seek. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`position`** (`Number`, required): The position/frame/time to seek to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$lottieSeek` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$lottieSeek[value;value;5]
```

## Reference implementation (source)

Taken from `src/functions/lottie/lottieSeek.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const lottie = ctx.lottieManager?.get(name);
        if (!lottie) return this.customError(ForgeCanvasError.NoLottie);

        lottie[
            type === LottieSeekType.frame ? 'seekFrame'
                : type === LottieSeekType.time ? 'seekTime'
            : 'seek'
        ](t);
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$lottieTo` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$loadLottieAnimation`]($loadLottieAnimation.md)
- [`$lottieOption`]($lottieOption.md)
- [`$lottieRender`]($lottieRender.md)

**Source:** [`src/functions/lottie/lottieSeek.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/lottie/lottieSeek.ts)
