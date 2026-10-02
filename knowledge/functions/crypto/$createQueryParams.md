# $createQueryParams

> Creates query params with given fields

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `crypto` | v1.0.7 | required | yes | `String` |

## Signature

```fs
$createQueryParams[param name;param value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `param name;param value` | `String` | **yes** | yes | The param name followed by the value, (param1;value1) |

### Per-parameter notes

- **`param name;param value`** (`String` , rest, required): The param name followed by the value, (param1;value1). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Crypto functions hash and encode strings (md5, sha family, base64, ...).

`$createQueryParams` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `param name;param value` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$createQueryParams[name]
```

## Reference implementation (source)

Taken from `src/native/crypto/createQueryParams.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const obj: Record<string, string> = {}
        for (let i = 0, len = params.length; i < len; i += 2) {
            obj[params[i]] = params[i + 1]
        }
        return this.success(stringify(obj))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$decodeURI`]($decodeURI.md)
- [`$decodeURIComponent`]($decodeURIComponent.md)
- [`$decrypt`]($decrypt.md)
- [`$deflate`]($deflate.md)
- [`$encodeURI`]($encodeURI.md)
- [`$encodeURIComponent`]($encodeURIComponent.md)
- [`$encrypt`]($encrypt.md)
- [`$inflate`]($inflate.md)

**Source:** [`src/native/crypto/createQueryParams.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/crypto/createQueryParams.ts)
