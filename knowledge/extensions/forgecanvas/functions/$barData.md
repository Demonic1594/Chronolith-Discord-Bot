# $barData

> Adds data to the progress bar

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `helper` | v1.2.0 | required | yes | — |

## Signature

```fs
$barData[value;style]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `value` | `Number` | **yes** | no | Value for the data segment (percentage or absolute) |
| 2 | `style` | `String` | **yes** | no | Style for the data segment |

### Per-parameter notes

- **`value`** (`Number`, required): Value for the data segment (percentage or absolute). Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`style`** (`String`, required): Style for the data segment. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$barData` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$barData[5;value]
```

## Reference implementation (source)

Taken from `src/functions/helper/barData.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        const barData = (ctx.getEnvironmentKey('progressBarData') || []) as BarData[];
        barData.push({ value: value, style });

        ctx.setEnvironmentKey('progressBarData', barData);
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$barOptions`]($barOptions.md)
- [`$drawProgressBar`]($drawProgressBar.md)
- [`$rectAlign`]($rectAlign.md)
- [`$rectBaseline`]($rectBaseline.md)
- [`$renderCanvasComponent`]($renderCanvasComponent.md)

**Source:** [`src/functions/helper/barData.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/helper/barData.ts)
