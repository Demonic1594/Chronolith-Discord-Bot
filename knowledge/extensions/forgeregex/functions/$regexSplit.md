# $regexSplit

> Splits a string with regex

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeRegex | `other` | v1.0.0 | required | yes | `Unknown` |

## Signature

```fs
$regexSplit[name;string;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the regex |
| 2 | `string` | `String` | **yes** | no | The string to split |
| 3 | `separator` | `String` | no | no | The separator to use for each result |

### Per-parameter notes

- **`name`** (`String`, required): The name of the regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`string`** (`String`, required): The string to split. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator to use for each result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$regexSplit` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$regexSplit[name;value]
```

**Full form (all arguments)**

```fs
$regexSplit[name;value;,]
```

## Reference implementation (source)

Taken from `src/native/regexSplit.ts` in the `ForgeRegex` repository — this is exactly what runs:

```ts
execute(...) {
        const regex = ctx.regexes?.get(name)
        if (!regex) return this.success()

        const split = string.split(regex)
        if (sep !== null) return this.success(split.join(sep))
        return this.successJSON(split)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createRegex`]($createRegex.md)
- [`$deleteRegex`]($deleteRegex.md)
- [`$getRegex`]($getRegex.md)
- [`$regexEscape`]($regexEscape.md)
- [`$regexExecute`]($regexExecute.md)
- [`$regexExists`]($regexExists.md)
- [`$regexFlags`]($regexFlags.md)
- [`$regexHasAnyFlags`]($regexHasAnyFlags.md)

**Source:** [`src/native/regexSplit.ts`](https://github.com/xNickyDev/ForgeRegex/blob/main/src/native/regexSplit.ts)
