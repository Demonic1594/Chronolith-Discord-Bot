# $regexExecute

> Executes a regex search on a string, returns the result

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeRegex | `other` | v1.0.0 | required | yes | `Unknown` |

> aliases: $regexExec

## Signature

```fs
$regexExecute[name;string;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the regex |
| 2 | `string` | `String` | **yes** | no | The string to execute |
| 3 | `separator` | `String` | no | no | The separator to use for each result |

### Per-parameter notes

- **`name`** (`String`, required): The name of the regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`string`** (`String`, required): The string to execute. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator to use for each result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$regexExecute` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$regexExecute[name;value]
```

**Full form (all arguments)**

```fs
$regexExecute[name;value;,]
```

## Reference implementation (source)

Taken from `src/native/regexExecute.ts` in the `ForgeRegex` repository — this is exactly what runs:

```ts
execute(...) {
        const exec = ctx.regexes?.get(name)?.exec(string)
        if (!exec) return this.success()

        if (sep !== null) return this.success(exec.join(sep))
        return this.successJSON(exec)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$regexExec` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createRegex`]($createRegex.md)
- [`$deleteRegex`]($deleteRegex.md)
- [`$getRegex`]($getRegex.md)
- [`$regexEscape`]($regexEscape.md)
- [`$regexExists`]($regexExists.md)
- [`$regexFlags`]($regexFlags.md)
- [`$regexHasAnyFlags`]($regexHasAnyFlags.md)
- [`$regexHasFlags`]($regexHasFlags.md)

**Source:** [`src/native/regexExecute.ts`](https://github.com/xNickyDev/ForgeRegex/blob/main/src/native/regexExecute.ts)
