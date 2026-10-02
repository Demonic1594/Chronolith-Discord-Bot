# $jsonMulti

> Multiplies a JSON key by a number

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `json` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$jsonMulti[keys;value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `keys;value` | `String` | **yes** | yes | Keys to traverse, last element is the target value |

### Per-parameter notes

- **`keys;value`** (`String` , rest, required): Keys to traverse, last element is the target value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

JSON functions parse/query/build JSON documents held in the environment.

`$jsonMulti` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `keys;value` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$jsonMulti[value]
```

## Reference implementation (source)

Taken from `src/functions/json/jsonMulti.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(jsonMath(ctx, keys, (a, b) => a * b));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$jsonDivide`]($jsonDivide.md)
- [`$jsonSub`]($jsonSub.md)
- [`$jsonSum`]($jsonSum.md)
- [`$qev`]($qev.md)

**Source:** [`src/functions/json/jsonMulti.ts`](https://github.com/nationdex/edge/blob/main/src/functions/json/jsonMulti.ts)
