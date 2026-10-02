# $indexedToHex

> Converts indexed pixels to HEX

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.2.1 | required | yes | — |

## Signature

```fs
$indexedToHex[palette;transparent;alwaysAlpha;allowShort;pixels]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `palette` | `Json` | **yes** | no | The palette to use for the conversion |
| 2 | `transparent` | `Number` | no | no | The index of the transparent color in the palette |
| 3 | `alwaysAlpha` | `Boolean` | no | no | Determines whether to always include the alpha channel in the output (default: false) |
| 4 | `allowShort` | `Boolean` | no | no | Whether to allow short hex output (default: false) |
| 5 | `pixels` | `Number` | **yes** | yes | The pixels to convert into HEX |

### Per-parameter notes

- **`palette`** (`Json`, required): The palette to use for the conversion. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.
- **`transparent`** (`Number`, optional): The index of the transparent color in the palette. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`alwaysAlpha`** (`Boolean`, optional): Determines whether to always include the alpha channel in the output (default: false). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`allowShort`** (`Boolean`, optional): Whether to allow short hex output (default: false). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`pixels`** (`Number` , rest, required): The pixels to convert into HEX. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$indexedToHex` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `pixels` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$indexedToHex[{"key":"value"};5]
```

**Full form (all arguments)**

```fs
$indexedToHex[{"key":"value"};5;true;true;5]
```

## Reference implementation (source)

Taken from `src/functions/util/indexedToHex.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            const res = indexedToHex(
                Uint8Array.from(pixels),
                Uint8Array.from(palette as unknown as number[]),
                transparent, aua ?? false,
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
2. Optional arguments (`transparent`, `alwaysAlpha`, `allowShort`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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
- [`$indexedToRgba`]($indexedToRgba.md)

**Source:** [`src/functions/util/indexedToHex.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/indexedToHex.ts)
