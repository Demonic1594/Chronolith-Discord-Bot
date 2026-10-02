# $addRestrictedMembers

> Adds restricted members to the current giveaway

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `manage` | v1.0.0 | required | yes | — |

> aliases: $addRestrictedMember

## Signature

```fs
$addRestrictedMembers[members]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `members` | `User` | **yes** | yes | The members to add as restriction |

### Per-parameter notes

- **`members`** (`User` , rest, required): The members to add as restriction. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

See the function list below for exact signatures.

`$addRestrictedMembers` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `members` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$addRestrictedMembers[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/manage/addRestrictedMembers.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.requirements ??= {}

        const set = new Set(ctx.requirements.restrictedMembers)
        for (const member of members) set.add(member.id)

        ctx.requirements.restrictedMembers = [...set]
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$addRestrictedMember` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRequiredRoles`]($addRequiredRoles.md)
- [`$addRestrictedRoles`]($addRestrictedRoles.md)
- [`$editGiveaway`]($editGiveaway.md)
- [`$endGiveaway`]($endGiveaway.md)
- [`$rerollGiveaway`]($rerollGiveaway.md)
- [`$startGiveaway`]($startGiveaway.md)

**Source:** [`src/native/manage/addRestrictedMembers.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/manage/addRestrictedMembers.ts)
