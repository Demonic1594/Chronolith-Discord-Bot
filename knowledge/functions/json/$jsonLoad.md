# $jsonLoad

> Loads JSON to an env variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v1.0.0 | required | yes | — |

## Signature

```fs
$jsonLoad[variable;json]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable to load json to |
| 2 | `json` | `Json` | **yes** | no | The json data |

### Per-parameter notes

- **`variable`** (`String`, required): The variable to load json to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`json`** (`Json`, required): The json data. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonLoad` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$jsonLoad[value;{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/native/json/jsonLoad.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.setEnvironmentKey(name, json)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
4. VERIFIED (2.7.1): writes the ENVIRONMENT store — read with `$env[var]`, not `$get[var]` (keywords store, always empty here). Also sets the hidden last-loaded pointer used by `$jsonSet`/`$jsonDelete`.

## Related functions

- [`$isJSON`]($isJSON.md)
- [`$jsonAssign`]($jsonAssign.md)
- [`$jsonDelete`]($jsonDelete.md)
- [`$jsonEntries`]($jsonEntries.md)
- [`$jsonFromEntries`]($jsonFromEntries.md)
- [`$jsonHas`]($jsonHas.md)
- [`$jsonKeys`]($jsonKeys.md)
- [`$jsonSet`]($jsonSet.md)

**Source:** [`src/native/json/jsonLoad.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonLoad.ts)
