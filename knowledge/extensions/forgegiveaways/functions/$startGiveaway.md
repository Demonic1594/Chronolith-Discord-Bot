# $startGiveaway

> Starts a new giveaway on a guild, returns giveaway id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeGiveaways | `manage` | v1.0.0 | required | yes | `String` |

## Signature

```fs
$startGiveaway[channel ID;host ID;prize;duration;winners]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel this giveaway will be created on |
| 2 | `host ID` | `Member` | **yes** | no | The member hosting this giveaway |
| 3 | `prize` | `String` | **yes** | no | The prize for this giveaway |
| 4 | `duration` | `Time` | **yes** | no | The duration for this giveaway |
| 5 | `winners` | `Number` | no | no | How many winners this giveaway will have |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel this giveaway will be created on. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`host ID`** (`Member`, required): The member hosting this giveaway. Expects a member ID. Fetched from the guild resolved by the `pointer` argument (usually a leading guild/channel arg) or the context guild.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`prize`** (`String`, required): The prize for this giveaway. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`duration`** (`Time`, required): The duration for this giveaway. Expects a duration. A raw number is used as milliseconds directly; otherwise parsed by `TimeParser` (`10m`, `1h30m`, `2d`, `45s`, ...).
- **`winners`** (`Number`, optional): How many winners this giveaway will have. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$startGiveaway` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$startGiveaway[123456789012345678;123456789012345678;value;10m]
```

**Full form (all arguments)**

```fs
$startGiveaway[123456789012345678;123456789012345678;value;10m;5]
```

## Reference implementation (source)

Taken from `src/native/manage/startGiveaway.ts` in the `ForgeGiveaways` repository — this is exactly what runs:

```ts
execute(...) {
        const client = ctx.client.getExtension(ForgeGiveaways, true)

        const giveaway = await client.giveawaysManager.start({
            guildID: (channel as GuildBasedChannel).guildId,
            channelID: channel.id,
            hostID: host.id,
            duration,
            prize,
            winnersCount: winners || 1,
            requirements: ctx.requirements
        }).catch(ctx.noop)

        return this.success(giveaway?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`winners`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Time arguments accept either a raw number (milliseconds) or a duration string like `10m`, `1h30m`, `2d`.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addRequiredRoles`]($addRequiredRoles.md)
- [`$addRestrictedMembers`]($addRestrictedMembers.md)
- [`$addRestrictedRoles`]($addRestrictedRoles.md)
- [`$editGiveaway`]($editGiveaway.md)
- [`$endGiveaway`]($endGiveaway.md)
- [`$rerollGiveaway`]($rerollGiveaway.md)

**Source:** [`src/native/manage/startGiveaway.ts`](https://github.com/tryforge/ForgeGiveaways/blob/main/src/native/manage/startGiveaway.ts)
