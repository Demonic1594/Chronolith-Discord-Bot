# $deleteGuildTemplate

> Deletes template from a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.5.0 | required | yes | `Boolean` |

> aliases: $deleteServerTemplate

## Signature

```fs
$deleteGuildTemplate[template code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `template code` | `Template` | **yes** | no | The code of the template to delete |

### Per-parameter notes

- **`template code`** (`Template`, required): The code of the template to delete. Expects a guild template code. Fetched via `client.fetchGuildTemplate`.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$deleteGuildTemplate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteGuildTemplate[code]
```

## Reference implementation (source)

Taken from `src/native/guild/deleteGuildTemplate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(await template.delete().catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteServerTemplate` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)
- [`$getGuildTemplate`]($getGuildTemplate.md)

**Source:** [`src/native/guild/deleteGuildTemplate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/deleteGuildTemplate.ts)
