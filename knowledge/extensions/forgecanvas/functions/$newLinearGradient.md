# $newLinearGradient

> Creates a linear gradient

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `gradient` | v1.0.0 | required | yes | — |

> aliases: $createLinearGradient, $linearGradient

## Signature

```fs
$newLinearGradient[name;x1;y1;x2;y2;stops]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Name of the new gradient |
| 2 | `x1` | `Number` | **yes** | no | The X coordinate of the start point |
| 3 | `y1` | `Number` | **yes** | no | The Y coordinate of the start point |
| 4 | `x2` | `Number` | **yes** | no | The X coordinate of the end point |
| 5 | `y2` | `Number` | **yes** | no | The Y coordinate of the end point |
| 6 | `stops` | `Number` | no | yes | The gradient's color stops |

### Per-parameter notes

- **`name`** (`String`, required): Name of the new gradient. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`x1`** (`Number`, required): The X coordinate of the start point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y1`** (`Number`, required): The Y coordinate of the start point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`x2`** (`Number`, required): The X coordinate of the end point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`y2`** (`Number`, required): The Y coordinate of the end point. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`stops`** (`Number` , rest, optional): The gradient's color stops. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$newLinearGradient` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `stops` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$newLinearGradient[name;5;5;5;5]
```

**Full form (all arguments)**

```fs
$newLinearGradient[name;5;5;5;5;5]
```

## Reference implementation (source)

Taken from `src/functions/gradient/newLinearGradient.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        if (!(ctx.gradientManager instanceof GradientManager))
            ctx.gradientManager = new GradientManager();

        ctx.gradientManager.set(name, GradientType.linear, x1, y1, x2, y2);
        for (const stop of ctx.gradientManager.stops)
            ctx.gradientManager?.get(name)?.addColorStop(...stop);

        ctx.gradientManager.stops = [];
        return this.success();
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createLinearGradient`, `$linearGradient` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addColorStop`]($addColorStop.md)
- [`$newConicGradient`]($newConicGradient.md)
- [`$newRadialGradient`]($newRadialGradient.md)

**Source:** [`src/functions/gradient/newLinearGradient.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/gradient/newLinearGradient.ts)
