# $httpGetHeader

> Gets an HTTP header

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `http` | v1.5.0 | required | yes | `String` |

## Signature

```fs
$httpGetHeader[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The header name |

### Per-parameter notes

- **`name`** (`String`, required): The header name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

HTTP functions perform network requests (`$httpRequest` and its header/body/result companions). They run against the BotForge validate API's syntax rules the same as any other function.

`$httpGetHeader` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$httpGetHeader[name]
```

## Reference implementation (source)

Taken from `src/native/http/httpGetHeader.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.http.response?.headers?.get(name))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$httpAddForm`]($httpAddForm.md)
- [`$httpAddHeader`]($httpAddHeader.md)
- [`$httpAppendFile`]($httpAppendFile.md)
- [`$httpAppendValue`]($httpAppendValue.md)
- [`$httpPing`]($httpPing.md)
- [`$httpRemoveHeader`]($httpRemoveHeader.md)
- [`$httpRequest`]($httpRequest.md)
- [`$httpResult`]($httpResult.md)

**Source:** [`src/native/http/httpGetHeader.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/http/httpGetHeader.ts)
