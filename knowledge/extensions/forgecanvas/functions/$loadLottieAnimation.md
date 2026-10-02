# $loadLottieAnimation

> Loads a lottie animation from an URL/File path or a JSON

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `lottie` | v1.3.0 | required | yes | — |

> aliases: $loadLottie, $lottie, $lottieAnimation

## Signature

```fs
$loadLottieAnimation[lottie;data;resourcePath]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `lottie` | `String` | **yes** | no | Name of the lottie animation to load |
| 2 | `data` | `String` | **yes** | no | Data of the lottie animation to load |
| 3 | `resourcePath` | `String` | no | no | Base path for resolving external resources (images, fonts) |

### Per-parameter notes

- **`lottie`** (`String`, required): Name of the lottie animation to load. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`data`** (`String`, required): Data of the lottie animation to load. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`resourcePath`** (`String`, optional): Base path for resolving external resources (images, fonts). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$loadLottieAnimation` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadLottieAnimation[value;value]
```

**Full form (all arguments)**

```fs
$loadLottieAnimation[value;value;value]
```

## Reference implementation (source)

Taken from `src/functions/lottie/loadLottieAnimation.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!(ctx.lottieManager instanceof LottieManager))
            ctx.lottieManager = new LottieManager();

        const d = existsSync(data) ? readFileSync(data) : data;
        ctx.lottieManager.set(
            name, LottieAnimation.loadFromData(
                d, resourcePath ? { resourcePath } : undefined
            )
        );

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$loadLottie`, `$lottie`, `$lottieAnimation` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`resourcePath`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$lottieOption`]($lottieOption.md)
- [`$lottieRender`]($lottieRender.md)
- [`$lottieSeek`]($lottieSeek.md)

**Source:** [`src/functions/lottie/loadLottieAnimation.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/lottie/loadLottieAnimation.ts)
