# $registerFont

> Registers a font

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeCanvas | `text` | v1.0.0 | required | yes | — |

> aliases: $registerFonts

## Signature

```fs
$registerFont[src;name;log]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `src` | `String` | **yes** | no | The font source path |
| 2 | `name` | `String` | no | no | The font name |
| 3 | `log` | `Boolean` | no | no | Whether to log the registration |

### Per-parameter notes

- **`src`** (`String`, required): The font source path. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, optional): The font name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`log`** (`Boolean`, optional): Whether to log the registration. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$registerFont` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$registerFont[value]
```

**Full form (all arguments)**

```fs
$registerFont[value;name;true]
```

## Reference implementation (source)

Taken from `src/functions/text/registerFont.ts` in the `ForgeCanvas` repository — this is exactly what runs:

```ts
execute(...) {
        try {
            return this.success(await registerFonts(
                [{ src: src, name }],
                log ?? false
            ));
        } catch(e: any) {
            return this.customError(e);
        }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$registerFonts` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`name`, `log`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fontFamilies`]($fontFamilies.md)
- [`$fontVariantCaps`]($fontVariantCaps.md)
- [`$letterSpacing`]($letterSpacing.md)
- [`$measureText`]($measureText.md)
- [`$textAlign`]($textAlign.md)
- [`$textBaseline`]($textBaseline.md)
- [`$wordSpacing`]($wordSpacing.md)

**Source:** [`src/functions/text/registerFont.ts`](https://github.com/tryforge/ForgeCanvas/blob/main/src/functions/text/registerFont.ts)
