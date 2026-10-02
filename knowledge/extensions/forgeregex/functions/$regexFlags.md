# $regexFlags

> Returns the flags of a regex

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeRegex | `other` | v1.0.0 | required | yes | `RegexFlags` |

> aliases: $regexFlag

## Signature

```fs
$regexFlags[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the regex |

### Per-parameter notes

- **`name`** (`String`, required): The name of the regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$regexFlags` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$regexFlags[name]
```

## Reference implementation (source)

Taken from `src/native/regexFlags.ts` in the `ForgeRegex` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.regexes?.get(name)?.flags)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$regexFlag` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createRegex`]($createRegex.md)
- [`$deleteRegex`]($deleteRegex.md)
- [`$getRegex`]($getRegex.md)
- [`$regexEscape`]($regexEscape.md)
- [`$regexExecute`]($regexExecute.md)
- [`$regexExists`]($regexExists.md)
- [`$regexHasAnyFlags`]($regexHasAnyFlags.md)
- [`$regexHasFlags`]($regexHasFlags.md)

**Source:** [`src/native/regexFlags.ts`](https://github.com/xNickyDev/ForgeRegex/blob/main/src/native/regexFlags.ts)
