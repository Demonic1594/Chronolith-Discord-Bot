# $djsVersion

> Returns the discord.js version used

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v2.2.0 | none | no | `String` |

## Signature

```fs
$djsVersion
```

## How it works

Uncategorized utilities.

`$djsVersion` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$djsVersion
```

## Reference implementation (source)

Taken from `src/native/other/djsVersion.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(version)
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)

## Community guides covering this function

- [$djsVersion guide](../../guides/guide-233.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-233)

**Source:** [`src/native/other/djsVersion.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/djsVersion.ts)
