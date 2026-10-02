# $jsonStringify

> Returns the JSON in stringified format

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v1.5.0 | required | yes | `Json` |

## Signature

```fs
$jsonStringify[variable;space]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable to stringify |
| 2 | `space` | `Number` | no | no | The space to use |

### Per-parameter notes

- **`variable`** (`String`, required): The variable to stringify. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`space`** (`Number`, optional): The space to use. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonStringify` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$jsonStringify[value]
```

**Full form (all arguments)**

```fs
$jsonStringify[value;5]
```

## Reference implementation (source)

Taken from `src/native/json/jsonStringify.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.successJSON(JSON.stringify(ctx.getEnvironmentKey(env), undefined, space || undefined))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`space`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$isJSON`]($isJSON.md)
- [`$jsonAssign`]($jsonAssign.md)
- [`$jsonDelete`]($jsonDelete.md)
- [`$jsonEntries`]($jsonEntries.md)
- [`$jsonFromEntries`]($jsonFromEntries.md)
- [`$jsonHas`]($jsonHas.md)
- [`$jsonKeys`]($jsonKeys.md)
- [`$jsonLoad`]($jsonLoad.md)

**Source:** [`src/native/json/jsonStringify.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonStringify.ts)
