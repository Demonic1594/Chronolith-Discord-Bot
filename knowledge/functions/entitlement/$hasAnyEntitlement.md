# $hasAnyEntitlement

> Checks whether this interaction user has any of the given entitlements

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `entitlement` | v1.5.0 | required | yes | `Boolean` |

> aliases: $interactionHasAnyEntitlement

## Signature

```fs
$hasAnyEntitlement[entitlement name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `entitlement name` | `String` | **yes** | yes | The name of the entitlements to validate |

### Per-parameter notes

- **`entitlement name`** (`String` , rest, required): The name of the entitlements to validate. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Entitlement functions read Discord monetization entitlements (premium purchases) for the application.

`$hasAnyEntitlement` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `entitlement name` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$hasAnyEntitlement[name]
```

## Reference implementation (source)

Taken from `src/native/entitlement/hasAnyEntitlement.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.interaction?.entitlements.hasAny(...names))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$interactionHasAnyEntitlement` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$entitlementConsume`]($entitlementConsume.md)
- [`$entitlementEndTimestamp`]($entitlementEndTimestamp.md)
- [`$entitlementGuildID`]($entitlementGuildID.md)
- [`$entitlementID`]($entitlementID.md)
- [`$entitlementIsActive`]($entitlementIsActive.md)
- [`$entitlementIsConsumed`]($entitlementIsConsumed.md)
- [`$entitlementIsDeleted`]($entitlementIsDeleted.md)
- [`$entitlementIsGuildSubscription`]($entitlementIsGuildSubscription.md)

**Source:** [`src/native/entitlement/hasAnyEntitlement.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/entitlement/hasAnyEntitlement.ts)
