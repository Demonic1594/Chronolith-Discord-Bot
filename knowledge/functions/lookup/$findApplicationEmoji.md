# $findApplicationEmoji

> Finds an application emoji of the client

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `lookup` | v2.2.0 | required | yes | `ApplicationEmoji` |

## Signature

```fs
$findApplicationEmoji[query]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `query` | `String` | **yes** | no | The id, format or emoji name to find |

### Per-parameter notes

- **`query`** (`String`, required): The id, format or emoji name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$findApplicationEmoji` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$findApplicationEmoji[query]
```

## Reference implementation (source)

Taken from `src/native/lookup/findApplicationEmoji.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const emojis = await ctx.fetchApplicationEmojis(true)

        if (CompiledFunction.IdRegex.test(q)) {
            const e = emojis?.get(q)
            if (e) return this.success(e.id)
        }

        return this.success(emojis?.find((x) => x.id === q || x.name?.toLowerCase() === q.toLowerCase() || x.toString() === q)?.id)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$findChannel`]($findChannel.md)
- [`$findChannels`]($findChannels.md)
- [`$findEmoji`]($findEmoji.md)
- [`$findGuild`]($findGuild.md)
- [`$findGuildChannel`]($findGuildChannel.md)
- [`$findGuildEmoji`]($findGuildEmoji.md)
- [`$findMember`]($findMember.md)
- [`$findMembers`]($findMembers.md)

**Source:** [`src/native/lookup/findApplicationEmoji.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/lookup/findApplicationEmoji.ts)
