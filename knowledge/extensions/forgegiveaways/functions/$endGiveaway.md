# $endGiveaway

> Ends an existing giveaway on a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `manage` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$endGiveaway[giveaway ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `giveaway ID` | `String` | **yes** | no | The giveaway to end |

### Per-parameter notes

- **`giveaway ID`** (`String`, required): The giveaway to end. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$endGiveaway` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$endGiveaway[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/manage/endGiveaway.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const client = ctx.client.getExtension(ForgeGiveaways, true)
        const giveaway = await client.giveawaysManager.end(id).catch(ctx.noop)
        return this.success(!!giveaway)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRequiredRoles`]($addRequiredRoles.md)
- [`$addRestrictedMembers`]($addRestrictedMembers.md)
- [`$addRestrictedRoles`]($addRestrictedRoles.md)
- [`$editGiveaway`]($editGiveaway.md)
- [`$rerollGiveaway`]($rerollGiveaway.md)
- [`$startGiveaway`]($startGiveaway.md)

**Source:** [`src/native/manage/endGiveaway.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/manage/endGiveaway.ts)
