# $getVar

> Returns an identifier's value in a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `old` | v1.0.0 | required | yes | `Unknown` |

## Signature

```fs
$getVar[name;id;default]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `id` | `String` | **yes** | no | The identifier of the value (a user, guild, channel, message, etc) |
| 3 | `default` | `String` | no | no | The default value if the identifier doesn't exist in the variable |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`id`** (`String`, required): The identifier of the value (a user, guild, channel, message, etc). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`default`** (`String`, optional): The default value if the identifier doesn't exist in the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$getVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getVar[name;123456789012345678]
```

**Full form (all arguments)**

```fs
$getVar[name;123456789012345678;value]
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`default`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteVar`]($deleteVar.md)
- [`$setVar`]($setVar.md)

**Source:** [`src/functions/old/getVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/old/getVar.ts)
