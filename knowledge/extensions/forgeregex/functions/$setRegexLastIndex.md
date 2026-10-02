# $setRegexLastIndex

> Sets the last index for a regex

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeRegex | `other` | v1.0.0 | required | yes | — |

## Signature

```fs
$setRegexLastIndex[name;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the regex |
| 2 | `index` | `Number` | **yes** | no | The index to set |

### Per-parameter notes

- **`name`** (`String`, required): The name of the regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`index`** (`Number`, required): The index to set. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Uncategorized utilities.

`$setRegexLastIndex` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setRegexLastIndex[name;5]
```

## Reference implementation (source)

Taken from `src/native/setRegexLastIndex.ts` in the `ForgeRegex` repository — this is exactly what runs:

```ts
execute(...) {
        const regex = ctx.regexes?.get(name)
        if (regex) regex.lastIndex = index
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createRegex`]($createRegex.md)
- [`$deleteRegex`]($deleteRegex.md)
- [`$getRegex`]($getRegex.md)
- [`$regexEscape`]($regexEscape.md)
- [`$regexExecute`]($regexExecute.md)
- [`$regexExists`]($regexExists.md)
- [`$regexFlags`]($regexFlags.md)
- [`$regexHasAnyFlags`]($regexHasAnyFlags.md)

**Source:** [`src/native/setRegexLastIndex.ts`](https://github.com/xNickyDev/ForgeRegex/blob/main/src/native/setRegexLastIndex.ts)
