# $addColorStop

> Adds a color stop to the gradient

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gradient` | v1.0.0 | required | yes | — |

> aliases: $colorStop

## Signature

```fs
$addColorStop[name;offset;color]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | no | no | Name of the gradient |
| 2 | `offset` | `Number` | **yes** | no | The color stop offset |
| 3 | `color` | `String` | **yes** | no | Color of the stop |

### Per-parameter notes

- **`name`** (`String`, optional): Name of the gradient. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`offset`** (`Number`, required): The color stop offset. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`color`** (`String`, required): Color of the stop. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$addColorStop` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addColorStop[name;5]
```

**Full form (all arguments)**

```fs
$addColorStop[name;5;#5865F2]
```

## Reference implementation (source)

Taken from `src/functions/gradient/addColorStop.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!(offset / 100 >= 0 && offset / 100 <= 1))
            return this.customError(ForgeCanvasError.InvalidOffset);

        if (!(ctx.gradientManager instanceof GradientManager))
            ctx.gradientManager = new GradientManager();

        const gradient = ctx.gradientManager?.get(name as string);
        if (name && !gradient) return this.customError(ForgeCanvasError.NoGradient);

        if (gradient) gradient.addColorStop(offset, color);
        else ctx.gradientManager.stops.push([offset, color]);

        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$colorStop` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$newConicGradient`]($newConicGradient.md)
- [`$newLinearGradient`]($newLinearGradient.md)
- [`$newRadialGradient`]($newRadialGradient.md)

**Source:** [`src/functions/gradient/addColorStop.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gradient/addColorStop.ts)
