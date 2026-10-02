# $findMember

> Finds a member of a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `lookup` | v1.0.0 | required | yes | `Member` |

## Signature

```fs
$findMember[guild ID;query;return author]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to find the member on |
| 2 | `query` | `String` | **yes** | no | The id, mention or name to find |
| 3 | `return author` | `Boolean` | no | no | Returns the current author id if none found |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to find the member on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`query`** (`String`, required): The id, mention or name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return author`** (`Boolean`, optional): Returns the current author id if none found. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$findMember` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$findMember[123456789012345678;query]
```

**Full form (all arguments)**

```fs
$findMember[123456789012345678;query;true]
```

## Reference implementation (source)

Taken from `src/native/lookup/findMember.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const id = q.replace(/[\\<>@!]/g, "").trim()

        if (CompiledFunction.IdRegex.test(id)) {
            const m = await guild.members.fetch(id).catch(ctx.noop)
            if (m) return this.success(m.id)
        }

        q = q.toLowerCase()

        const query = await guild.members
            .search({
                query: q,
            })
            .catch(ctx.noop)

        return this.success(query && query.size ? query.at(0)?.id : rt ? ctx.user?.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`return author`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$findApplicationEmoji`]($findApplicationEmoji.md)
- [`$findChannel`]($findChannel.md)
- [`$findChannels`]($findChannels.md)
- [`$findEmoji`]($findEmoji.md)
- [`$findGuild`]($findGuild.md)
- [`$findGuildChannel`]($findGuildChannel.md)
- [`$findGuildEmoji`]($findGuildEmoji.md)
- [`$findMembers`]($findMembers.md)

**Source:** [`src/native/lookup/findMember.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/lookup/findMember.ts)
