# $player

> Retrieves data from an event whose context was a player event

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `event` | v1.0.0 | optional | yes | `Json`, `Unknown` |

## Signature

```fs
$player[property]
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

`$player` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$player[value]
```

## Reference implementation (source)

Taken from `src/native/event/player.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        const player = ctx.player
        if (!player || prop) return this.success(player?.[prop])
        return this.successJSON(player)
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
- [`$operator`]($operator.md)
- [`$playerBan`]($playerBan.md)
- [`$serverState`]($serverState.md)

**Source:** [`src/native/event/player.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/event/player.ts)
