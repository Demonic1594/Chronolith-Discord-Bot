# $encrypt

> Encrypts given text with a key

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `crypto` | v1.5.0 | required | yes | `String` |

## Signature

```fs
$encrypt[text;key]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `text` | `String` | **yes** | no | The text to encrypt |
| 2 | `key` | `String` | **yes** | no | The key to use to encrypt text |

### Per-parameter notes

- **`text`** (`String`, required): The text to encrypt. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`key`** (`String`, required): The key to use to encrypt text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Crypto functions hash and encode strings (md5, sha family, base64, ...).

`$encrypt` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$encrypt[Hello!;value]
```

## Reference implementation (source)

Taken from `src/native/crypto/encrypt.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(encrypt(text, key))
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
- [`$inflate`]($inflate.md)

**Source:** [`src/native/crypto/encrypt.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/crypto/encrypt.ts)
