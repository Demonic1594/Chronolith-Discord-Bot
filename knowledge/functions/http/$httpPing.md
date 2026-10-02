# $httpPing

> Returns the response time of the HTTP request

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `http` | v1.5.0 | none | no | `Number` |

> ⚠️ **experimental** · aliases: $httpResponseTime

## Signature

```fs
$httpPing
```

## How it works

HTTP functions perform network requests (`$httpRequest` and its header/body/result companions). They run against the BotForge validate API's syntax rules the same as any other function.

`$httpPing` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$httpPing
```

## Reference implementation (source)

Taken from `src/native/http/httpPing.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.http.response?.ping?.toFixed() ?? 0)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$httpResponseTime` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Marked **experimental** in source — behavior may change without a major version bump.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$httpAddForm`]($httpAddForm.md)
- [`$httpAddHeader`]($httpAddHeader.md)
- [`$httpAppendFile`]($httpAppendFile.md)
- [`$httpAppendValue`]($httpAppendValue.md)
- [`$httpGetHeader`]($httpGetHeader.md)
- [`$httpRemoveHeader`]($httpRemoveHeader.md)
- [`$httpRequest`]($httpRequest.md)
- [`$httpResult`]($httpResult.md)

**Source:** [`src/native/http/httpPing.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/http/httpPing.ts)
