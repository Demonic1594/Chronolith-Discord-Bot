# $entitlementConsume

> Consumes an entitlement from an interaction

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `entitlement` | v1.5.0 | none | yes | `Boolean` |

## Signature

```fs
$entitlementConsume[entitlement name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `entitlement name` | `String` | **yes** | no | The name of the entitlement to consume |

### Per-parameter notes

- **`entitlement name`** (`String`, required): The name of the entitlement to consume. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Entitlement functions read Discord monetization entitlements (premium purchases) for the application.

`$entitlementConsume` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$entitlementConsume[name]
```

## Reference implementation (source)

Taken from `src/native/entitlement/entitlementConsume.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            ctx.interaction?.entitlements.get(name)?.consume().then(() => true).catch(ctx.noop) ?? false
        )
}
```

## Quirks & gotchas

1. This function has no brackets — it is used bare.
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$entitlementEndTimestamp`]($entitlementEndTimestamp.md)
- [`$entitlementGuildID`]($entitlementGuildID.md)
- [`$entitlementID`]($entitlementID.md)
- [`$entitlementIsActive`]($entitlementIsActive.md)
- [`$entitlementIsConsumed`]($entitlementIsConsumed.md)
- [`$entitlementIsDeleted`]($entitlementIsDeleted.md)
- [`$entitlementIsGuildSubscription`]($entitlementIsGuildSubscription.md)
- [`$entitlementIsUserSubscription`]($entitlementIsUserSubscription.md)

**Source:** [`src/native/entitlement/entitlementConsume.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/entitlement/entitlementConsume.ts)
