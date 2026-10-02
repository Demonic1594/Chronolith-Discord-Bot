# $jsonSet

> Adds a JSON key with a value

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `json` | v1.2.0 | required | yes | `Boolean` |

## Signature

```fs
$jsonSet[keys;value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `keys;value` | `String` | **yes** | yes | The keys to traverse, with the value to use at the end |

### Per-parameter notes

- **`keys;value`** (`String` , rest, required): The keys to traverse, with the value to use at the end. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonSet` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `keys;value` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$jsonSet[value]
```

## Reference implementation (source)

Taken from `src/native/json/jsonSet.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.traverseAddEnvironmentKey(parseJSON(keys[keys.length - 1]), ...keys.slice(0, -1)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
4. VERIFIED (2.7.1): operates on the MOST RECENTLY `$jsonLoad`-ed JSON (hidden last-loaded pointer; there is no variable argument). The value is parseJSON'd: bare snowflakes lose precision past 2^53 — quote-wrap large IDs. Two consecutive dynamic keys (`$get[a];$get[b]`) silently fail.

## Related functions

- [`$isJSON`]($isJSON.md)
- [`$jsonAssign`]($jsonAssign.md)
- [`$jsonDelete`]($jsonDelete.md)
- [`$jsonEntries`]($jsonEntries.md)
- [`$jsonFromEntries`]($jsonFromEntries.md)
- [`$jsonHas`]($jsonHas.md)
- [`$jsonKeys`]($jsonKeys.md)
- [`$jsonLoad`]($jsonLoad.md)

**Source:** [`src/native/json/jsonSet.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/json/jsonSet.ts)
