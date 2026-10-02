# $jsonHas

> Returns whether a key exists in a JSON object

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v2.2.0 | required | yes | `Boolean` |

## Signature

```fs
$jsonHas[variable;key]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | The variable that holds json |
| 2 | `key` | `String` | **yes** | no | The key to check for |

### Per-parameter notes

- **`variable`** (`String`, required): The variable that holds json. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`key`** (`String`, required): The key to check for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonHas` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$jsonHas[value;value]
```

## Reference implementation (source)

Taken from `src/native/json/jsonHas.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const json = ctx.getEnvironmentKey(name)
        if (!json) return this.success()
        return this.success(Object.hasOwn(json, key))
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
- [`$jsonKeys`]($jsonKeys.md)
- [`$jsonLoad`]($jsonLoad.md)
- [`$jsonSet`]($jsonSet.md)

**Source:** [`src/native/json/jsonHas.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonHas.ts)
