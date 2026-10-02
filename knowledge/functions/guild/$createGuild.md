# $createGuild

> Creates a new guild, returns guild id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.5.0 | required | yes | `Guild` |

> 🚫 **deprecated** · aliases: $createServer

## Signature

```fs
$createGuild[name;icon;template]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | no | The name for the guild |
| 2 | `icon` | `URL` | no | no | The icon for the guild |
| 3 | `template` | `Template` | no | no | The template to use for the guild |

### Per-parameter notes

- **`name`** (`String`, required): The name for the guild. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`icon`** (`URL`, optional): The icon for the guild. Expects a URL. Must match `https://...` — plain `http://` URLs FAIL the built-in check (regex is `^http?s:\/\/`, which effectively requires the `s`). A Discord custom emoji string is also accepted and auto-converted to its CDN URL.
- **`template`** (`Template`, optional): The template to use for the guild. Expects a guild template code. Fetched via `client.fetchGuildTemplate`.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$createGuild` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$createGuild[name]
```

**Full form (all arguments)**

```fs
$createGuild[name;https://example.com;value]
```

## Reference implementation (source)

Taken from `src/native/guild/createGuild.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const guild = await (template
            ? template.createGuild(name, icon || undefined).catch(ctx.noop)
            : ctx.client.guilds.create({ name, icon }).catch(ctx.noop)
        )
        return this.success(guild?.id)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$createServer` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`icon`, `template`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. URL arguments must start with `https://` — plain `http://` fails the built-in URL check.
5. Marked **deprecated** in source — migrate away from this function.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)
- [`$getGuildTemplate`]($getGuildTemplate.md)

**Source:** [`src/native/guild/createGuild.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/createGuild.ts)
