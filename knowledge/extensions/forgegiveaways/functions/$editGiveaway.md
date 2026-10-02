# $editGiveaway

> Edits an existing giveaway on a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `manage` | v1.1.0 | required | yes | `Boolean` |

## Signature

```fs
$editGiveaway[giveaway ID;guild ID;host ID;prize;winners]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `giveaway ID` | `String` | **yes** | no | The giveaway to edit |
| 2 | `guild ID` | `Guild` | **yes** | no | The guild this giveaway is hosted on |
| 3 | `host ID` | `Member` | no | no | The new member hosting this giveaway |
| 4 | `prize` | `String` | no | no | The new prize for this giveaway |
| 5 | `winners` | `Number` | no | no | The new winners count for this giveaway |

### Per-parameter notes

- **`giveaway ID`** (`String`, required): The giveaway to edit. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`Guild`, required): The guild this giveaway is hosted on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`host ID`** (`Member`, optional): The new member hosting this giveaway. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`prize`** (`String`, optional): The new prize for this giveaway. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`winners`** (`Number`, optional): The new winners count for this giveaway. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$editGiveaway` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editGiveaway[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$editGiveaway[123456789012345678;123456789012345678;123456789012345678;value;5]
```

## Reference implementation (source)

Taken from `src/native/manage/editGiveaway.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const client = ctx.client.getExtension(ForgeGiveaways, true)

        const giveaway = await client.giveawaysManager.edit(id, {
            hostID: host?.id,
            prize: prize || undefined,
            winnersCount: winners || undefined,
            requirements: ctx.requirements
        }).catch(ctx.noop)

        return this.success(!!giveaway)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`host ID`, `prize`, `winners`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRequiredRoles`]($addRequiredRoles.md)
- [`$addRestrictedMembers`]($addRestrictedMembers.md)
- [`$addRestrictedRoles`]($addRestrictedRoles.md)
- [`$endGiveaway`]($endGiveaway.md)
- [`$rerollGiveaway`]($rerollGiveaway.md)
- [`$startGiveaway`]($startGiveaway.md)

**Source:** [`src/native/manage/editGiveaway.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/manage/editGiveaway.ts)
