# $pi

> Returns the constant pi

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `math` | v2.2.0 | none | no | `Number` |

## Signature

```fs
$pi
```

## How it works

Math functions evaluate arithmetic expressions and apply numeric operations.

`$pi` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$pi
```

## Reference implementation (source)

Taken from `src/native/math/pi.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(Math.PI)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$abs`]($abs.md)
- [`$base`]($base.md)
- [`$bigintDivide`]($bigintDivide.md)
- [`$bigintMulti`]($bigintMulti.md)
- [`$bigintSub`]($bigintSub.md)
- [`$bigintSum`]($bigintSum.md)
- [`$ceil`]($ceil.md)
- [`$divide`]($divide.md)

## Community guides covering this function

- [$pi guide](../../guides/guide-106.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-106)
- [$pi guide](../../guides/guide-107.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-107)

**Source:** [`src/native/math/pi.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/math/pi.ts)
