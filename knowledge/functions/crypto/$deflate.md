# $deflate

> Compresses given input

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `crypto` | v1.2.0 | required | yes | `String` |

## Signature

```fs
$deflate[input;encoding]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `input` | `String` | **yes** | no | The text to compress |
| 2 | `encoding` | `String` | no | no | The output encoding to use |

### Per-parameter notes

- **`input`** (`String`, required): The text to compress. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`encoding`** (`String`, optional): The output encoding to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Crypto functions hash and encode strings (md5, sha family, base64, ...).

`$deflate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deflate[value]
```

**Full form (all arguments)**

```fs
$deflate[value;value]
```

## Reference implementation (source)

Taken from `src/native/crypto/deflate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(deflateSync(input).toString((out ?? "hex") as BufferEncoding))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`encoding`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createQueryParams`]($createQueryParams.md)
- [`$decodeURI`]($decodeURI.md)
- [`$decodeURIComponent`]($decodeURIComponent.md)
- [`$decrypt`]($decrypt.md)
- [`$encodeURI`]($encodeURI.md)
- [`$encodeURIComponent`]($encodeURIComponent.md)
- [`$encrypt`]($encrypt.md)
- [`$inflate`]($inflate.md)

**Source:** [`src/native/crypto/deflate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/crypto/deflate.ts)
