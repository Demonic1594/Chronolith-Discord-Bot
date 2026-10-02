# $findGuild

> Finds a guild

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `lookup` | v2.2.0 | required | yes | `Guild` |

## Signature

```fs
$findGuild[query;return guild]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `query` | `String` | **yes** | no | The id or guild name to find |
| 2 | `return guild` | `Boolean` | no | no | Returns the current guild id if none found |

### Per-parameter notes

- **`query`** (`String`, required): The id or guild name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return guild`** (`Boolean`, optional): Returns the current guild id if none found. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$findGuild` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$findGuild[query]
```

**Full form (all arguments)**

```fs
$findGuild[query;true]
```

## Reference implementation (source)

Taken from `src/native/lookup/findGuild.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (CompiledFunction.IdRegex.test(q)) {
            const guild = ctx.client.guilds.cache.get(q)
            if (guild) return this.success(guild.id)
        }

        return this.success(
            ctx.client.guilds.cache.find((x) => x.id === q || x.name === q)?.id ?? (rt ? ctx.guild?.id : undefined)
        )
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`return guild`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$findApplicationEmoji`]($findApplicationEmoji.md)
- [`$findChannel`]($findChannel.md)
- [`$findChannels`]($findChannels.md)
- [`$findEmoji`]($findEmoji.md)
- [`$findGuildChannel`]($findGuildChannel.md)
- [`$findGuildEmoji`]($findGuildEmoji.md)
- [`$findMember`]($findMember.md)
- [`$findMembers`]($findMembers.md)

**Source:** [`src/native/lookup/findGuild.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/lookup/findGuild.ts)
