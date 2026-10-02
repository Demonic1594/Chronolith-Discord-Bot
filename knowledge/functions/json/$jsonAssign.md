# $jsonAssign

> Combines multiple JSON objects into a single JSON object

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v2.6.0 | required | yes | `Json` |

## Signature

```fs
$jsonAssign[variable;other variable;objects]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable that holds the target object |
| 2 | `other variable` | `String` | no | no | The variable to load the result to, leave empty to return output |
| 3 | `objects` | `Json` | **yes** | yes | The objects from which to copy properties |

### Per-parameter notes

- **`variable`** (`String`, required): The variable that holds the target object. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`other variable`** (`String`, optional): The variable to load the result to, leave empty to return output. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`objects`** (`Json` , rest, required): The objects from which to copy properties. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonAssign` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `objects` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$jsonAssign[value;value]
```

**Full form (all arguments)**

```fs
$jsonAssign[value;value;{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/native/json/jsonAssign.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const json = ctx.getEnvironmentKey(var1)
        if (!json) return this.success()

        const obj = Object.assign(json, ...objects)
        if (var2) return this.success(void ctx.setEnvironmentKey(var2, obj))
        else return this.successJSON(obj)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`other variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$isJSON`]($isJSON.md)
- [`$jsonDelete`]($jsonDelete.md)
- [`$jsonEntries`]($jsonEntries.md)
- [`$jsonFromEntries`]($jsonFromEntries.md)
- [`$jsonHas`]($jsonHas.md)
- [`$jsonKeys`]($jsonKeys.md)
- [`$jsonLoad`]($jsonLoad.md)
- [`$jsonSet`]($jsonSet.md)

**Source:** [`src/native/json/jsonAssign.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonAssign.ts)
