# $entitlementIsActive

> Returns whether this entitlement is active

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `entitlement` | v1.5.0 | none | no | `Boolean` |

## Signature

```fs
$entitlementIsActive
```

## How it works

Entitlement functions read Discord monetization entitlements (premium purchases) for the application.

`$entitlementIsActive` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$entitlementIsActive
```

## Reference implementation (source)

Taken from `src/native/entitlement/entitlementIsActive.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.entitlement?.isActive())
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$entitlementConsume`]($entitlementConsume.md)
- [`$entitlementEndTimestamp`]($entitlementEndTimestamp.md)
- [`$entitlementGuildID`]($entitlementGuildID.md)
- [`$entitlementID`]($entitlementID.md)
- [`$entitlementIsConsumed`]($entitlementIsConsumed.md)
- [`$entitlementIsDeleted`]($entitlementIsDeleted.md)
- [`$entitlementIsGuildSubscription`]($entitlementIsGuildSubscription.md)
- [`$entitlementIsUserSubscription`]($entitlementIsUserSubscription.md)

**Source:** [`src/native/entitlement/entitlementIsActive.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/entitlement/entitlementIsActive.ts)
