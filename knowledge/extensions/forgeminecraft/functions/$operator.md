# $operator

> Retrieves data from an event whose context was an operator event

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `event` | v1.0.0 | optional | yes | `Json`, `Unknown` |

## Signature

```fs
$operator[property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `property` | `Enum` | **yes** | no | The property to pull |

### Per-parameter notes

- **`property`** (`Enum`, required): The property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Event functions (re)schedule guild scheduled events and set their channel/location metadata.

`$operator` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$operator[value]
```

## Reference implementation (source)

Taken from `src/native/event/operator.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        const operator = ctx.operator
        if (!operator || prop) return this.success(OperatorProperties[prop](operator))
        return this.successJSON(operator)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$gameRule`]($gameRule.md)
- [`$ipBan`]($ipBan.md)
- [`$player`]($player.md)
- [`$playerBan`]($playerBan.md)
- [`$serverState`]($serverState.md)

**Source:** [`src/native/event/operator.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/event/operator.ts)
