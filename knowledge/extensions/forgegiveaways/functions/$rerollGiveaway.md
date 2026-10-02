# $rerollGiveaway

> Rerolls an existing giveaway on a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `manage` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$rerollGiveaway[giveaway ID;unique;amount]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `giveaway ID` | `String` | **yes** | no | The giveaway to reroll |
| 2 | `unique` | `Boolean` | no | no | Whether to not include the previous winners, defaults to false |
| 3 | `amount` | `Number` | no | no | The amount of new winners, defaults to max winners count |

### Per-parameter notes

- **`giveaway ID`** (`String`, required): The giveaway to reroll. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`unique`** (`Boolean`, optional): Whether to not include the previous winners, defaults to false. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`amount`** (`Number`, optional): The amount of new winners, defaults to max winners count. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$rerollGiveaway` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$rerollGiveaway[123456789012345678]
```

**Full form (all arguments)**

```fs
$rerollGiveaway[123456789012345678;true;5]
```

## Reference implementation (source)

Taken from `src/native/manage/rerollGiveaway.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const client = ctx.client.getExtension(ForgeGiveaways, true)
        const giveaway = await client.giveawaysManager.reroll(id, unique || undefined, amount || undefined).catch(ctx.noop)
        return this.success(!!giveaway)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`unique`, `amount`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRequiredRoles`]($addRequiredRoles.md)
- [`$addRestrictedMembers`]($addRestrictedMembers.md)
- [`$addRestrictedRoles`]($addRestrictedRoles.md)
- [`$editGiveaway`]($editGiveaway.md)
- [`$endGiveaway`]($endGiveaway.md)
- [`$startGiveaway`]($startGiveaway.md)

**Source:** [`src/native/manage/rerollGiveaway.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/manage/rerollGiveaway.ts)
