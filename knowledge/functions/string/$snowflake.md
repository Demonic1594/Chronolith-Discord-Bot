# $snowflake

> Generates a snowflake, this value will never clash

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.4.0 | none | no | `String` |

## Signature

```fs
$snowflake
```

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$snowflake` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$snowflake
```

## Reference implementation (source)

Taken from `src/native/string/snowflake.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(SnowflakeUtil.generate().toString())
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropArgs`]($cropArgs.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)

**Source:** [`src/native/string/snowflake.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/snowflake.ts)
