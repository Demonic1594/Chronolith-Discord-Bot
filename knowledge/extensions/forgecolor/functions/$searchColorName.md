# $searchColorName

> Finds named colors that contain a substring (case-insensitive).

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeColor | `utility` | v1.1.0 | required | yes | `String` |

## Signature

```fs
$searchColorName[query;limit;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `query` | `String` | **yes** | no | The substring to search for. |
| 2 | `limit` | `Number` | no | no | Maximum number of results to return. |
| 3 | `separator` | `String` | no | no | String used to join multiple results. |

### Per-parameter notes

- **`query`** (`String`, required): The substring to search for.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`limit`** (`Number`, optional): Maximum number of results to return.. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`separator`** (`String`, optional): String used to join multiple results.. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$searchColorName` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$searchColorName[query]
```

**Full form (all arguments)**

```fs
$searchColorName[query;5;,]
```

## Reference implementation (source)

Taken from `src/functions/utility/searchColorName.ts` in the `ForgeColor` repository — this is exactly what runs:

```ts
execute(...) {
    // Clamp n between 1 and total available colors
    const totalColors = ForgeColor.Colors.length;
    limit = Math.trunc(Math.max(1, Math.min(Number(limit) || 5, totalColors)));
    const results = searchColorName(query, limit ?? 5);

    if (!results.length) return this.success();
    return this.success(results.map((c) => c.name).join(separator ?? ", "));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`limit`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$colorContrastRatio`]($colorContrastRatio.md)
- [`$colorDistance`]($colorDistance.md)
- [`$colorFormatType`]($colorFormatType.md)
- [`$colorTemperature`]($colorTemperature.md)
- [`$findClosestColorName`]($findClosestColorName.md)
- [`$getColorChannel`]($getColorChannel.md)
- [`$getColorFromName`]($getColorFromName.md)
- [`$isDarkColor`]($isDarkColor.md)

**Source:** [`src/functions/utility/searchColorName.ts`](https://github.com/user-lezi/ForgeColor/blob/main/src/functions/utility/searchColorName.ts)
