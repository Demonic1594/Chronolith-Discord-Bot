# $getGuildTemplate

> Gets the data of a guild template

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `guild` | v1.5.0 | required | yes | `Json`, `Unknown` |

> aliases: $getServerTemplate

## Signature

```fs
$getGuildTemplate[template code;property]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `template code` | `Template` | **yes** | no | The code of the template to get |
| 2 | `property` | `Enum` | no | no | The property of the template to return |

### Per-parameter notes

- **`template code`** (`Template`, required): The code of the template to get. Expects a guild template code. Fetched via `client.fetchGuildTemplate`.
- **`property`** (`Enum`, optional): The property of the template to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Guild functions read and mutate guild-level data — members, bans, channels, roles, features, icons, vanity URLs, templates.

`$getGuildTemplate` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getGuildTemplate[code]
```

**Full form (all arguments)**

```fs
$getGuildTemplate[code;value]
```

## Reference implementation (source)

Taken from `src/native/guild/getGuildTemplate.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.successJSON(prop ? template[prop] : template)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$getServerTemplate` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`property`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createGuild`]($createGuild.md)
- [`$createGuildTemplate`]($createGuildTemplate.md)
- [`$deleteGuild`]($deleteGuild.md)
- [`$deleteGuildApplicationCommands`]($deleteGuildApplicationCommands.md)
- [`$deleteGuildTemplate`]($deleteGuildTemplate.md)
- [`$editGuildTemplate`]($editGuildTemplate.md)
- [`$getGuildInvite`]($getGuildInvite.md)
- [`$getGuildPreview`]($getGuildPreview.md)

**Source:** [`src/native/guild/getGuildTemplate.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/guild/getGuildTemplate.ts)
