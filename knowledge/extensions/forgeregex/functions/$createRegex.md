# $createRegex

> Creates a new regex

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeRegex | `other` | v1.0.0 | required | yes | — |

## Signature

```fs
$createRegex[name;pattern;flags]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the new regex |
| 2 | `pattern` | `String` | **yes** | no | The pattern of the regex |
| 3 | `flags` | `String` | no | no | The flags of the regex |

### Per-parameter notes

- **`name`** (`String`, required): The name of the new regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`pattern`** (`String`, required): The pattern of the regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`flags`** (`String`, optional): The flags of the regex. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Uncategorized utilities.

`$createRegex` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createRegex[name;value]
```

**Full form (all arguments)**

```fs
$createRegex[name;value;value]
```

## Reference implementation (source)

Taken from `src/native/createRegex.ts` in the `ForgeRegex` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.regexes ??= new RegexManager()
        ctx.regexes.set(name, pattern, flags || undefined)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`flags`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteRegex`]($deleteRegex.md)
- [`$getRegex`]($getRegex.md)
- [`$regexEscape`]($regexEscape.md)
- [`$regexExecute`]($regexExecute.md)
- [`$regexExists`]($regexExists.md)
- [`$regexFlags`]($regexFlags.md)
- [`$regexHasAnyFlags`]($regexHasAnyFlags.md)
- [`$regexHasFlags`]($regexHasFlags.md)

**Source:** [`src/native/createRegex.ts`](https://github.com/xNickyDev/ForgeRegex/blob/main/src/native/createRegex.ts)
