# $editGuildTemplate

> Edits template on a guild, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.5.0 | required | yes | `Boolean` |

> aliases: $editServerTemplate

## Signature

```fs
$editGuildTemplate[template code;name;description]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `template code` | `Template` | **yes** | no | The code of the template to edit |
| 2 | `name` | `String` | no | no | The new name for the template |
| 3 | `description` | `String` | no | no | The new description for the template |

### Per-parameter notes

- **`template code`** (`Template`, required): The code of the template to edit. Expects a guild template code. Fetched via `client.fetchGuildTemplate`.
- **`name`** (`String`, optional): The new name for the template. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`description`** (`String`, optional): The new description for the template. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$editGuildTemplate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$editGuildTemplate[code]
```

**Full form (all arguments)**

```fs
$editGuildTemplate[code;name;value]
```

## Reference implementation (source)

Taken from `src/native/guild/editGuildTemplate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const edit = await template.edit({
            name: name || undefined,
            description: desc ?? undefined
        }).catch(ctx.noop)

        return this.success(!!edit)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$editServerTemplate` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`name`, `description`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)
- [`$getGuildTemplate`]($getGuildTemplate.md)

**Source:** [`src/native/guild/editGuildTemplate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/editGuildTemplate.ts)
