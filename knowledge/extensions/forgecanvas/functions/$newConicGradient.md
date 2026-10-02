# $newConicGradient

> Creates a conic gradient

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gradient` | v1.0.0 | required | yes | — |

> aliases: $createConicGradient, $conicGradient

## Signature

```fs
$newConicGradient[name;start;x;y;stops]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the new gradient |
| 2 | `start` | `Number` | **yes** | no | The angle at which to begin the gradient, in radians. The angle starts from a line going horizontally right from the center, and proceeds clockwise |
| 3 | `x` | `Number` | **yes** | no | The X coordinate of the center of the gradient |
| 4 | `y` | `Number` | **yes** | no | The Y coordinate of the center of the gradient |
| 5 | `stops` | `Number` | no | yes | The gradient's color stops |

### Per-parameter notes

- **`name`** (`String`, required): Name of the new gradient. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`start`** (`Number`, required): The angle at which to begin the gradient, in radians. The angle starts from a line going horizontally right from the center, and proceeds clockwise. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`x`** (`Number`, required): The X coordinate of the center of the gradient. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y`** (`Number`, required): The Y coordinate of the center of the gradient. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`stops`** (`Number` , rest, optional): The gradient's color stops. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$newConicGradient` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `stops` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$newConicGradient[name;5;5;5]
```

**Full form (all arguments)**

```fs
$newConicGradient[name;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/gradient/newConicGradient.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!(ctx.gradientManager instanceof GradientManager))
            ctx.gradientManager = new GradientManager();

        ctx.gradientManager.set(name, GradientType.conic, sAngle, x, y);
        for (const stop of ctx.gradientManager.stops)
            ctx.gradientManager?.get(name)?.addColorStop(...stop);

        ctx.gradientManager.stops = [];
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createConicGradient`, `$conicGradient` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addColorStop`]($addColorStop.md)
- [`$newLinearGradient`]($newLinearGradient.md)
- [`$newRadialGradient`]($newRadialGradient.md)

**Source:** [`src/functions/gradient/newConicGradient.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gradient/newConicGradient.ts)
