# $applicationCommands

> Returns all application commands

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v1.5.0 | optional | yes | `Json` |

## Signature

```fs
$applicationCommands[guild ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get application commands from |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get application commands from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$applicationCommands` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$applicationCommands[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/bot/applicationCommands.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const commands = await ctx.client.application.commands.fetch({ guildId: guild?.id }).catch(ctx.noop)
        return this.successJSON(commands)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandCount`]($applicationCommandCount.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)
- [`$botMutualGuilds`]($botMutualGuilds.md)

**Source:** [`src/native/bot/applicationCommands.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/applicationCommands.ts)
