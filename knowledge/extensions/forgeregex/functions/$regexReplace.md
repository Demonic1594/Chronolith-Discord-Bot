# $regexReplace

> Replace text in a string using regex

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeRegex | `other` | v1.0.2 | required | yes | `String` |

## Signature

```fs
$regexReplace[name;text;new value;amount]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the regex to match in base |
| 2 | `text` | `String` | **yes** | no | The base text |
| 3 | `new value` | `String` | **yes** | no | The text to replace matches with |
| 4 | `amount` | `Number` | no | no | How many times to perform this replacement |

### Per-parameter notes

- **`name`** (`String`, required): The name of the regex to match in base. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`text`** (`String`, required): The base text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new value`** (`String`, required): The text to replace matches with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`amount`** (`Number`, optional): How many times to perform this replacement. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Uncategorized utilities.

`$regexReplace` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$regexReplace[name;Hello!;value]
```

**Full form (all arguments)**

```fs
$regexReplace[name;Hello!;value;5]
```

## Reference implementation (source)

Taken from `src/native/regexReplace.ts` in the `ForgeRegex` repository — this is exactly what runs:

```ts
execute(...) {
        amount ??= -1
        const regex = ctx.regexes?.get(name)
        if (!regex) return this.success()

        if (amount === -1) {
            return this.success(text.replace(regex, replacement))
        }

        let i = 0
        return this.success(text.replace(regex, (m) => (++i <= amount ? replacement : m)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`amount`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createRegex`]($createRegex.md)
- [`$deleteRegex`]($deleteRegex.md)
- [`$getRegex`]($getRegex.md)
- [`$regexEscape`]($regexEscape.md)
- [`$regexExecute`]($regexExecute.md)
- [`$regexExists`]($regexExists.md)
- [`$regexFlags`]($regexFlags.md)
- [`$regexHasAnyFlags`]($regexHasAnyFlags.md)

**Source:** [`src/native/regexReplace.ts`](https://github.com/xNickyDev/ForgeRegex/blob/main/src/native/regexReplace.ts)
