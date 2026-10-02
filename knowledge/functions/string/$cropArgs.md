# $cropArgs

> Crops given args

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.4.0 | required | yes | `String` |

## Signature

```fs
$cropArgs[args;start index;end index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `args` | `String` | **yes** | no | The args to crop |
| 2 | `start index` | `Number` | **yes** | no | The start index to start cropping |
| 3 | `end index` | `Number` | no | no | The end index to finish cropping |

### Per-parameter notes

- **`args`** (`String`, required): The args to crop. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`start index`** (`Number`, required): The start index to start cropping. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`end index`** (`Number`, optional): The end index to finish cropping. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$cropArgs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$cropArgs[value;5]
```

**Full form (all arguments)**

```fs
$cropArgs[value;5;5]
```

## Reference implementation (source)

Taken from `src/native/string/cropArgs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            text
                .split(/ +/)
                .slice(start, end || undefined)
                .join(" ")
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`end index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedReplace`]($advancedReplace.md)
- [`$argCount`]($argCount.md)
- [`$charCodeAt`]($charCodeAt.md)
- [`$charCount`]($charCount.md)
- [`$checkContains`]($checkContains.md)
- [`$cropText`]($cropText.md)
- [`$endsWith`]($endsWith.md)
- [`$fromCharCode`]($fromCharCode.md)

**Source:** [`src/native/string/cropArgs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/cropArgs.ts)
