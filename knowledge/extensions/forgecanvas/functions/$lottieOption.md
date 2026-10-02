# $lottieOption

> Returns an option of the lottie animation

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `lottie` | v1.3.0 | required | yes | — |

> aliases: $lottieProperty, $lottieOpt, $lottieAnimationOption, $lottieAnimationProperty

## Signature

```fs
$lottieOption[lottie;option]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `lottie` | `String` | **yes** | no | Name of the lottie animation |
| 2 | `option` | `Enum` | **yes** | no | The option to get |

### Per-parameter notes

- **`lottie`** (`String`, required): Name of the lottie animation. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`option`** (`Enum`, required): The option to get. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

See the function list below for exact signatures.

`$lottieOption` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$lottieOption[value;value]
```

## Reference implementation (source)

Taken from `src/functions/lottie/lottieOption.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const lottie = ctx.lottieManager?.get(name);
        if (!lottie) return this.customError(ForgeCanvasError.NoLottie);

        // @ts-expect-error
        return this.success(lottie[
            typeof option === 'number' ? LottieOption[option] : option
        ]);
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$lottieProperty`, `$lottieOpt`, `$lottieAnimationOption`, `$lottieAnimationProperty` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$loadLottieAnimation`]($loadLottieAnimation.md)
- [`$lottieRender`]($lottieRender.md)
- [`$lottieSeek`]($lottieSeek.md)

**Source:** [`src/functions/lottie/lottieOption.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/lottie/lottieOption.ts)
