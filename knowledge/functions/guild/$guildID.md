# $guildID

> Returns the guild id with given name

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.0.0 | optional | yes | `Guild` |

> aliases: $serverID

## Signature

```fs
$guildID[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | yes | The guild name to return the id |

### Per-parameter notes

- **`name`** (`String` , rest, required): The guild name to return the id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `name` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$guildID[name]
```

## Reference implementation (source)

Taken from `src/native/guild/guildID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (!this.hasFields) return this.success(ctx.guild?.id ?? ctx.interaction?.guildId)
        const name = args.join(";")
        return this.success(ctx.client.guilds.cache.find((x) => x.name === name)?.id)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$serverID` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)

## Community guides covering this function

- [$guildID guide](../../guides/guide-140.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-140)

**Source:** [`src/native/guild/guildID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildID.ts)
