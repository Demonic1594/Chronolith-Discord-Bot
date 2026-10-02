# $randomString

> Creates a random string

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `string` | v1.2.0 | required | yes | `String` |

## Signature

```fs
$randomString[length;characters]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `length` | `Number` | **yes** | no | The length of the random string |
| 2 | `characters` | `String` | no | no | The characters to use for this string |

### Per-parameter notes

- **`length`** (`Number`, required): The length of the random string. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`characters`** (`String`, optional): The characters to use for this string. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

String functions transform and inspect text (slicing, casing, search, split/join).

`$randomString` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$randomString[5]
```

**Full form (all arguments)**

```fs
$randomString[5;value]
```

## Reference implementation (source)

Taken from `src/native/string/randomString.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const arr = chars ? [...chars] : CharArray
        return this.success(Array.from({ length: len }, () => arr[Math.floor(Math.random() * arr.length)]).join(""))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`characters`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

## Community guides covering this function

- [$randomString guide](../../guides/guide-151.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-151)

**Source:** [`src/native/string/randomString.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/string/randomString.ts)
