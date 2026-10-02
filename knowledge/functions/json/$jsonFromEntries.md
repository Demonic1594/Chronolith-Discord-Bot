# $jsonFromEntries

> Converts an array of entries into an object

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v2.7.0 | required | yes | `Json` |

> aliases: $fromEntries

## Signature

```fs
$jsonFromEntries[variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable to get entries from |

### Per-parameter notes

- **`variable`** (`String`, required): The variable to get entries from. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonFromEntries` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$jsonFromEntries[value]
```

## Reference implementation (source)

Taken from `src/native/json/jsonFromEntries.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const arr = ctx.getEnvironmentKey(name)
        if (!Array.isArray(arr)) return this.success()

        try {
            return this.successJSON(Object.fromEntries(arr))
        } catch {
            return this.success()
        }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fromEntries` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$isJSON`]($isJSON.md)
- [`$jsonAssign`]($jsonAssign.md)
- [`$jsonDelete`]($jsonDelete.md)
- [`$jsonEntries`]($jsonEntries.md)
- [`$jsonHas`]($jsonHas.md)
- [`$jsonKeys`]($jsonKeys.md)
- [`$jsonLoad`]($jsonLoad.md)
- [`$jsonSet`]($jsonSet.md)

**Source:** [`src/native/json/jsonFromEntries.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonFromEntries.ts)
