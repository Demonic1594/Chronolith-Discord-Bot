# $rgbaToHex

> Converts RGBA into HEX

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.2.1 | required | yes | — |

## Signature

```fs
$rgbaToHex[alwaysIncludeAlpha;allowShort;rgba]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `alwaysIncludeAlpha` | `Boolean` | no | no | Whether to always include the alpha channel in the output (default: false) |
| 2 | `allowShort` | `Boolean` | no | no | Whether to allow short hex output (default: false) |
| 3 | `rgba` | `Number` | **yes** | yes | The RGBA to convert into HEX |

### Per-parameter notes

- **`alwaysIncludeAlpha`** (`Boolean`, optional): Whether to always include the alpha channel in the output (default: false). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`allowShort`** (`Boolean`, optional): Whether to allow short hex output (default: false). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`rgba`** (`Number` , rest, required): The RGBA to convert into HEX. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$rgbaToHex` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `rgba` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$rgbaToHex[true]
```

**Full form (all arguments)**

```fs
$rgbaToHex[true;true;5]
```

## Reference implementation (source)

Taken from `src/functions/util/rgbaToHex.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            const res = rgbaToHex(
                Uint8Array.from(rgba),
                aia ?? false,
                a_s ?? false
            );
            return this.success(`[${res.map(x => `"${x}"`).join(', ')}]`);
        } catch(e) {
            return this.customError((e as any).toString());
        }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`alwaysIncludeAlpha`, `allowShort`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$canvasVersion`]($canvasVersion.md)
- [`$clearCanvasCache`]($clearCanvasCache.md)
- [`$compositeOperation`]($compositeOperation.md)
- [`$filter`]($filter.md)
- [`$getPixels`]($getPixels.md)
- [`$hexToRgb`]($hexToRgb.md)
- [`$hexToRgba`]($hexToRgba.md)
- [`$indexedToHex`]($indexedToHex.md)

**Source:** [`src/functions/util/rgbaToHex.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/rgbaToHex.ts)
