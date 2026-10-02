# $addRequiredRoles

> Adds required roles to the current giveaway

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `manage` | v1.0.0 | required | yes | — |

> aliases: $addRequiredRole

## Signature

```fs
$addRequiredRoles[roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `roles` | `String` | **yes** | yes | The roles to add as requirement |

### Per-parameter notes

- **`roles`** (`String` , rest, required): The roles to add as requirement. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$addRequiredRoles` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addRequiredRoles[value]
```

## Reference implementation (source)

Taken from `src/native/manage/addRequiredRoles.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.requirements ??= {}

        const set = new Set(ctx.requirements.requiredRoles)
        for (const role of roles) set.add(role)

        ctx.requirements.requiredRoles = [...set]
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$addRequiredRole` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRestrictedMembers`]($addRestrictedMembers.md)
- [`$addRestrictedRoles`]($addRestrictedRoles.md)
- [`$editGiveaway`]($editGiveaway.md)
- [`$endGiveaway`]($endGiveaway.md)
- [`$rerollGiveaway`]($rerollGiveaway.md)
- [`$startGiveaway`]($startGiveaway.md)

**Source:** [`src/native/manage/addRequiredRoles.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/manage/addRequiredRoles.ts)
