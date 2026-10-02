# $applicationCommandCount

> Returns the amount of application commands registered by this bot

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v1.4.0 | optional | yes | `Number` |

> aliases: $slashCommandCount

## Signature

```fs
$applicationCommandCount[guild ID;count sub]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | no | no | The guild to get application command count from |
| 2 | `count sub` | `Boolean` | no | no | Whether to count sub commands |

### Per-parameter notes

- **`guild ID`** (`Guild`, optional): The guild to get application command count from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`count sub`** (`Boolean`, optional): Whether to count sub commands. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$applicationCommandCount` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$applicationCommandCount[123456789012345678]
```

**Full form (all arguments)**

```fs
$applicationCommandCount[123456789012345678;true]
```

## Reference implementation (source)

Taken from `src/native/bot/applicationCommandCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const commands = await ctx.client.application.commands.fetch({ guildId: g?.id }).catch(ctx.noop)
        if (!commands) return this.success(0)

        if (sub) {
            let count = 0
            commands.forEach((command) => {
                let cont = true
                command.options.forEach((cmd) => {
                    if (cmd.type === ApplicationCommandOptionType.Subcommand) {
                        count++
                        cont = false
                    } else if (cmd.type === ApplicationCommandOptionType.SubcommandGroup) {
                        cmd.options?.forEach((x) => count++)
                        cont = false
                    }
                })
                if (cont) count++
            })
            return this.success(count)
        } else {
            return this.success(commands.size)
        }
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$slashCommandCount` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`guild ID`, `count sub`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommands`]($applicationCommands.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)
- [`$botMutualGuilds`]($botMutualGuilds.md)

**Source:** [`src/native/bot/applicationCommandCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/applicationCommandCount.ts)
