# $httpAddForm

> Adds form data to request

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `http` | v1.4.0 | none | no | — |

## Signature

```fs
$httpAddForm
```

## How it works

HTTP functions perform network requests (`$httpRequest` and its header/body/result companions). They run against the BotForge validate API's syntax rules the same as any other function.

`$httpAddForm` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$httpAddForm
```

## Reference implementation (source)

Taken from `src/native/http/httpAddForm.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.http.form = new FormData()
        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$httpAddHeader`]($httpAddHeader.md)
- [`$httpAppendFile`]($httpAppendFile.md)
- [`$httpAppendValue`]($httpAppendValue.md)
- [`$httpGetHeader`]($httpGetHeader.md)
- [`$httpPing`]($httpPing.md)
- [`$httpRemoveHeader`]($httpRemoveHeader.md)
- [`$httpRequest`]($httpRequest.md)
- [`$httpResult`]($httpResult.md)

**Source:** [`src/native/http/httpAddForm.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/http/httpAddForm.ts)
