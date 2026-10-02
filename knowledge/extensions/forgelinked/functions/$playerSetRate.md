# $playerSetRate

> Set custom filter.timescale#rate. This method disables both: nightcore & vaporwave. Use 1 to reset.

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeLinked | `filters` | v2.1.0 | required | yes | `Boolean` |

## Signature

```fs
$playerSetRate[guildId;rate]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guildId` | `Guild` | no | no | The guild id to set the rate for |
| 2 | `rate` | `Number` | **yes** | no | The rate to set |

### Per-parameter notes

- **`guildId`** (`Guild`, optional): The guild id to set the rate for. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`rate`** (`Number`, required): The rate to set. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$playerSetRate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$playerSetRate[123456789012345678]
```

**Full form (all arguments)**

```fs
$playerSetRate[123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/natives/filters/playerSetRate.ts` in the `ForgeLinked` repository — this is exactly what runs:

```ts
execute(...) {
    try {
      const linked = ctx.client.getExtension(ForgeLinked, true)?.lavalink
      if (!linked) return this.customError('ForgeLinked is not initialized')
      if (!guildId) guildId = ctx.guild
      if (!guildId)
        return this.customError(
          'Unable to find any guild. Ensure this command was ran inside of a guild and not DMs or a group chat',
        )
      const player = linked.getPlayer(guildId.id)
      if (!player) return this.customError('Player not found')
      if (!player.node?.connected)
        return this.customError(
          'Lavalink node is not connected. Please wait for the node to reconnect.',
        )
      if (rate <= 0) return this.customError('Rate must be greater than 0 (use 1 to reset)')
      const res = await player.filterManager.setRate(rate)
      return this.success(res)
    } catch (err) {
      return this.customError(
        `Failed to set rate: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`guildId`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$playerApplyFilters`]($playerApplyFilters.md)
- [`$playerCheckFilterState`]($playerCheckFilterState.md)
- [`$playerFilterSetEQ`]($playerFilterSetEQ.md)
- [`$playerFilters`]($playerFilters.md)
- [`$playerFiltersClearEQ`]($playerFiltersClearEQ.md)
- [`$playerFiltersSetVolume`]($playerFiltersSetVolume.md)
- [`$playerIsCustomFilterActive`]($playerIsCustomFilterActive.md)
- [`$playerResetFilters`]($playerResetFilters.md)

**Source:** [`src/natives/filters/playerSetRate.ts`](https://github.com/tryforge/ForgeLinked/blob/main/src/natives/filters/playerSetRate.ts)
