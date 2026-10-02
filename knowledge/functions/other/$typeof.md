# $typeof

> Returns the type of the provided argument

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `other` | v2.4.0 | required | yes | `String` |

## Signature

```fs
$typeof[argument]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `argument` | `String` | **yes** | no | The argument to get its type |

### Per-parameter notes

- **`argument`** (`String`, required): The argument to get its type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$typeof` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$typeof[value]
```

## Reference implementation (source)

Taken from `src/native/other/typeof.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        let type: string

        if (arg === "undefined") type = "undefined"
        else if (arg === "true" || arg === "false") type = "boolean"
        else if (BigIntFormatRegex.test(arg)) type = "bigint"
        else if (arg === "NaN" || (!!arg.trim() && !isNaN(Number(arg)))) type = "number"
        else {
            try {
                JSON.parse(arg)
                type = "object"
            } catch {
                type = "string"
            }
        }

        return this.success(type)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$advancedBar`]($advancedBar.md)
- [`$awaitComponent`]($awaitComponent.md)
- [`$awaitMessage`]($awaitMessage.md)
- [`$awaitModalSubmit`]($awaitModalSubmit.md)
- [`$bar`]($bar.md)
- [`$c`]($c.md)
- [`$callFunction`]($callFunction.md)
- [`$callLocalFunction`]($callLocalFunction.md)

**Source:** [`src/native/other/typeof.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/other/typeof.ts)
