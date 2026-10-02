# $canvasVersion

> Returns the forge.canvas version

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `util` | v1.1.0 | optional | yes | — |

## Signature

```fs
$canvasVersion[@napi-rs/canvas]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `@napi-rs/canvas` | `Boolean` | no | no | Returns the @napi-rs/canvas version used by forge.canvas instead if true |

### Per-parameter notes

- **`@napi-rs/canvas`** (`Boolean`, optional): Returns the @napi-rs/canvas version used by forge.canvas instead if true. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$canvasVersion` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$canvasVersion[true]
```

## Reference implementation (source)

Taken from `src/functions/util/canvasVersion.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`@napi-rs/canvas`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$clearCanvasCache`]($clearCanvasCache.md)
- [`$compositeOperation`]($compositeOperation.md)
- [`$filter`]($filter.md)
- [`$getPixels`]($getPixels.md)
- [`$hexToRgb`]($hexToRgb.md)
- [`$hexToRgba`]($hexToRgba.md)
- [`$indexedToHex`]($indexedToHex.md)
- [`$indexedToRgba`]($indexedToRgba.md)

**Source:** [`src/functions/util/canvasVersion.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/util/canvasVersion.ts)
