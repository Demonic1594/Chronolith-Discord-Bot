# $guildHasAnyFeatures

> Returns whether this guild has any of the given features

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.4.0 | required | yes | `Boolean` |

> aliases: $guildHasAnyFeature, $hasAnyGuildFeatures, $hasAnyGuildFeature

## Signature

```fs
$guildHasAnyFeatures[guild ID;features]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to check for features |
| 2 | `features` | `Enum` | **yes** | yes | The features to check for |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to check for features. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`features`** (`Enum` , rest, required): The features to check for. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$guildHasAnyFeatures` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `features` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$guildHasAnyFeatures[123456789012345678;value]
```

## Reference implementation (source)

Taken from `src/native/guild/guildHasAnyFeatures.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(features.some(x => g.features.includes(x)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$guildHasAnyFeature`, `$hasAnyGuildFeatures`, `$hasAnyGuildFeature` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)

**Source:** [`src/native/guild/guildHasAnyFeatures.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/guildHasAnyFeatures.ts)
