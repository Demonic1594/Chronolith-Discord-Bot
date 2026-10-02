# $deleteVar

> Deletes a value from a variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `old` | v1.0.0 | required | yes | — |

## Signature

```fs
$deleteVar[name;id]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable |
| 2 | `id` | `String` | **yes** | no | The identifier of the value (a user, guild, channel, message, etc) |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`id`** (`String`, required): The identifier of the value (a user, guild, channel, message, etc). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$deleteVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteVar[name;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/old/deleteVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.delete({
            type: "old",
            id,
            name,
        })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getVar`]($getVar.md)
- [`$setVar`]($setVar.md)

**Source:** [`src/functions/old/deleteVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/old/deleteVar.ts)
