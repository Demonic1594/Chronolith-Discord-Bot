# $botTeamMembers

> Returns the client's team members

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v2.4.0 | optional | yes | `Unknown[]` |

> aliases: $clientTeamMembers

## Signature

```fs
$botTeamMembers[property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `property` | `Enum` | **yes** | no | The property of each team member to return |
| 2 | `separator` | `String` | no | no | The separator to use for every property |

### Per-parameter notes

- **`property`** (`Enum`, required): The property of each team member to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for every property. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botTeamMembers` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$botTeamMembers[value]
```

**Full form (all arguments)**

```fs
$botTeamMembers[value;,]
```

## Reference implementation (source)

Taken from `src/native/bot/botTeamMembers.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!ctx.client.application.owner) await ctx.client.application.fetch().catch(ctx.noop)
        const owner = ctx.client.application.owner
        return this.success(owner instanceof Team ? owner.members.map(x => TeamMemberProperties[prop || TeamMemberProperty.id](x)).join(sep ?? ", ") : null)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$clientTeamMembers` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandCount`]($applicationCommandCount.md)
- [`$applicationCommands`]($applicationCommands.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)

**Source:** [`src/native/bot/botTeamMembers.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/botTeamMembers.ts)
