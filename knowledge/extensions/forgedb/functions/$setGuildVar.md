# $setGuildVar

> Assigns a value to a variable associated with a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeDB | `guild` | v2.0.0 | required | yes | — |

> aliases: $setServerVar

## Signature

```fs
$setGuildVar[name;value;guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name of the variable to set the value in |
| 2 | `value` | `String` | **yes** | no | The value to be assigned |
| 3 | `guild ID` | `String` | no | no | The guild ID for which to set the variable value |

### Per-parameter notes

- **`name`** (`String`, required): The name of the variable to set the value in. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`value`** (`String`, required): The value to be assigned. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild ID`** (`String`, optional): The guild ID for which to set the variable value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$setGuildVar` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setGuildVar[name;value]
```

**Full form (all arguments)**

```fs
$setGuildVar[name;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/guild/setGuildVar.ts` in the `ForgeDB` repository — this is exactly what runs:

```ts
execute(...) {
        await DataBase.set({ name, id: guild ?? ctx.guild!.id, value, type: "guild" })
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setServerVar` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`guild ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteGuildVar`]($deleteGuildVar.md)
- [`$getGuildLeaderboardID`]($getGuildLeaderboardID.md)
- [`$getGuildLeaderboardLength`]($getGuildLeaderboardLength.md)
- [`$getGuildLeaderboardValue`]($getGuildLeaderboardValue.md)
- [`$getGuildVar`]($getGuildVar.md)
- [`$guildLeaderboard`]($guildLeaderboard.md)

**Source:** [`src/functions/guild/setGuildVar.ts`](https://github.com/tryforge/ForgeDB/blob/main/src/functions/guild/setGuildVar.ts)
