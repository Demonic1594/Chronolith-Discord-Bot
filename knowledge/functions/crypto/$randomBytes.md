# $randomBytes

> Generates a string of random bytes, in hex

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `crypto` | v1.5.0 | required | yes | `String` |

## Signature

```fs
$randomBytes[length]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `length` | `Number` | **yes** | no | The length of the hex string |

### Per-parameter notes

- **`length`** (`Number`, required): The length of the hex string. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Crypto functions hash and encode strings (md5, sha family, base64, ...).

`$randomBytes` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$randomBytes[5]
```

## Reference implementation (source)

Taken from `src/native/crypto/randomBytes.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(randomBytes(len).toString("hex"))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createQueryParams`]($createQueryParams.md)
- [`$decodeURI`]($decodeURI.md)
- [`$decodeURIComponent`]($decodeURIComponent.md)
- [`$decrypt`]($decrypt.md)
- [`$deflate`]($deflate.md)
- [`$encodeURI`]($encodeURI.md)
- [`$encodeURIComponent`]($encodeURIComponent.md)
- [`$encrypt`]($encrypt.md)

**Source:** [`src/native/crypto/randomBytes.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/crypto/randomBytes.ts)
