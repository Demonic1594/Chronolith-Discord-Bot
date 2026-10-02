# $setGlobalVar

> Assigns a value to a variable associated with a global

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `global` | v2.0.0 | required | yes | — |

## Signature

```fs
$setGlobalVar[name;value]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to set the value in |
| 2 | `value` | `String` | **yes** | no | The value to be assigned |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to set the value in. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The value to be assigned. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$setGlobalVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setGlobalVar[name;value]
```

## Reference implementation (source)

Taken from `src/functions/global/setGlobalVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.set({ name, value, type: "custom" })
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGlobalVar`]($deleteGlobalVar.md)
- [`$getGlobalVar`]($getGlobalVar.md)

**Source:** [`src/functions/global/setGlobalVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/global/setGlobalVar.ts)
