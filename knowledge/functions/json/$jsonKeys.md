# $jsonKeys

> Gets keys from a JSON variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v1.4.0 | required | yes | `Json` |

## Signature

```fs
$jsonKeys[variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable to get keys from |

### Per-parameter notes

- **`variable`** (`String`, required): The variable to get keys from. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonKeys` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$jsonKeys[value]
```

## Reference implementation (source)

Taken from `src/native/json/jsonKeys.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const json = ctx.getEnvironmentKey(name)
        if (!json) return this.success()
        return this.successJSON(Object.keys(json))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$isJSON`]($isJSON.md)
- [`$jsonAssign`]($jsonAssign.md)
- [`$jsonDelete`]($jsonDelete.md)
- [`$jsonEntries`]($jsonEntries.md)
- [`$jsonFromEntries`]($jsonFromEntries.md)
- [`$jsonHas`]($jsonHas.md)
- [`$jsonLoad`]($jsonLoad.md)
- [`$jsonSet`]($jsonSet.md)

**Source:** [`src/native/json/jsonKeys.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonKeys.ts)
