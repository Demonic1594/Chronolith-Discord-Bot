# $isValidLink

> Checks whether a link is valid, this will not make sure that a site actually exists or returns success HTTP responses

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `condition` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$isValidLink[link]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `link` | `String` | **yes** | no | The link to check |

### Per-parameter notes

- **`link`** (`String`, required): The link to check. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Condition helpers (`$checkCondition`, `$and`, `$or`, validators) evaluate boolean logic over resolved values.

`$isValidLink` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isValidLink[https://example.com]
```

## Reference implementation (source)

Taken from `src/native/condition/isValidLink.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(LinkRegex.test(link))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$and`]($and.md)
- [`$checkCondition`]($checkCondition.md)
- [`$isBoolean`]($isBoolean.md)
- [`$isValidHex`]($isValidHex.md)
- [`$or`]($or.md)

**Source:** [`src/native/condition/isValidLink.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/condition/isValidLink.ts)
