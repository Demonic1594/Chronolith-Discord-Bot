# $findRole

> Finds a role of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `lookup` | v1.0.0 | required | yes | `Role` |

## Signature

```fs
$findRole[guild ID;query]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to find the role on |
| 2 | `query` | `String` | **yes** | no | The id, mention or role name to find |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to find the role on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`query`** (`String`, required): The id, mention or role name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$findRole` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$findRole[123456789012345678;query]
```

## Reference implementation (source)

Taken from `src/native/lookup/findRole.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const id = q.replace(RoleMentionCharRegex, "")

        if (CompiledFunction.IdRegex.test(id)) {
            const r = guild.roles.cache.get(id)
            if (r) return this.success(r.id)
        }

        q = q.toLowerCase()

        return this.success(guild.roles.cache.find((x) => x.id === id || x.name.toLowerCase() === q)?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$findApplicationEmoji`]($findApplicationEmoji.md)
- [`$findChannel`]($findChannel.md)
- [`$findChannels`]($findChannels.md)
- [`$findEmoji`]($findEmoji.md)
- [`$findGuild`]($findGuild.md)
- [`$findGuildChannel`]($findGuildChannel.md)
- [`$findGuildEmoji`]($findGuildEmoji.md)
- [`$findMember`]($findMember.md)

**Source:** [`src/native/lookup/findRole.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/lookup/findRole.ts)
