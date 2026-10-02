# $processEnv

> Gets the Node.js environment variable value

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| Edge | `other` | v1.0.0 | required | yes | `Unknown` |

## Signature

```fs
$processEnv[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | Environment variable name |

### Per-parameter notes

- **`name`** (`String`, required): Environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$processEnv` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$processEnv[name]
```

## Reference implementation (source)

Taken from `src/functions/other/processEnv.ts` in the `Edge` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(process.env[name]);
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$benchmark`]($benchmark.md)
- [`$call`]($call.md)
- [`$parallel`]($parallel.md)
- [`$require`]($require.md)
- [`$requireCache`]($requireCache.md)
- [`$spread`]($spread.md)
- [`$updateEvents`]($updateEvents.md)
- [`$updateStructures`]($updateStructures.md)

**Source:** [`src/functions/other/processEnv.ts`](https://github.com/nationdex/edge/blob/main/src/functions/other/processEnv.ts)
