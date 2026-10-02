# $httpRequest

> Performs an http request, returns the status code

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `http` | v1.0.0 | required | yes | `Number` |

## Signature

```fs
$httpRequest[url;method;variable]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `url` | `String` | **yes** | no | The url to perform this request to |
| 2 | `method` | `String` | **yes** | no | The method to use |
| 3 | `variable` | `String` | no | no | Environment variable name to load the response to |

### Per-parameter notes

- **`url`** (`String`, required): The url to perform this request to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`method`** (`String`, required): The method to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`variable`** (`String`, optional): Environment variable name to load the response to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

HTTP functions perform network requests (`$httpRequest` and its header/body/result companions). They run against the BotForge validate API's syntax rules the same as any other function.

`$httpRequest` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**GET into the default result variable (returns the HTTP status code!)**

```fs
$httpRequest[https://api.example.com/ping;GET]
```

**Gate on status, then read the auto-parsed body from the env var**

```fs
$if[$httpRequest[https://api.example.com/data;GET;res]==200;$env[res;status];request failed]
```

**POST with staged options**

```fs
$httpSetContentType[Text]$httpAddHeader[Authorization;Bearer token]$httpSetBody[{"q":"hi"}]$!httpRequest[https://api.example.com/search;POST;res]
```

## Reference implementation (source)

Taken from `src/native/http/httpRequest.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        name ??= "result"

        if (ctx.http.response) delete ctx.http.response

        let ms = performance.now()
        const req = await fetch(url, {
            ...ctx.http,
            method,
            body: ctx.http.body ?? ctx.http.form
        }).catch(ctx.noop)
        ms = performance.now() - ms

        if (!req) return this.success(void ctx.clearHttpOptions())

        const contentType = req.headers.get("content-type")?.split(";")[0]
        const overrideType = ctx.http.contentType

        ctx.clearHttpOptions()
        ctx.http.response = { headers: req.headers, ping: ms }
        
        if (overrideType !== undefined) {
            ctx.setEnvironmentKey(name, await req[HTTPContentType[overrideType].toLowerCase() as Lowercase<keyof typeof HTTPContentType>]())
        } else {
            if (contentType === "application/json") {
                ctx.setEnvironmentKey(name, await req.json())
            } else if (contentType?.includes("image")) {
                ctx.setEnvironmentKey(name, await req.arrayBuffer().then(x => Buffer.from(x).toString("base64")))
            } else {
                ctx.setEnvironmentKey(name, await req.text())
            }
        }

        return this.success(req.status)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`variable`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.
5. VERIFIED (2.7.1): returns the HTTP STATUS CODE, not the body — the body goes into the response env var (read with `$env[var]`). Staged options (headers/body/form) are consumed and CLEARED by each call — restage for consecutive requests.

## Related functions

- [`$httpAddForm`]($httpAddForm.md)
- [`$httpAddHeader`]($httpAddHeader.md)
- [`$httpAppendFile`]($httpAppendFile.md)
- [`$httpAppendValue`]($httpAppendValue.md)
- [`$httpGetHeader`]($httpGetHeader.md)
- [`$httpPing`]($httpPing.md)
- [`$httpRemoveHeader`]($httpRemoveHeader.md)
- [`$httpResult`]($httpResult.md)

**Source:** [`src/native/http/httpRequest.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/http/httpRequest.ts)
