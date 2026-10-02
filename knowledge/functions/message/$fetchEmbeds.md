# $fetchEmbeds

> Fetches an embed or all embeds from a message to the next response

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.4.0 | optional | yes | — |

> aliases: $fetchEmbed, $cloneEmbed, $cloneEmbeds

## Signature

```fs
$fetchEmbeds[channel ID;message ID;index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `TextChannel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to get embeds from |
| 3 | `index` | `Number` | no | no | The embed index to load |

### Per-parameter notes

- **`channel ID`** (`TextChannel`, required): The channel to pull message from. Expects a textable channel ID. Same snowflake rules as Channel, but the channel must support messages (`.messages` present), otherwise rejected.
- **`message ID`** (`Message`, required): The message to get embeds from. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`index`** (`Number`, optional): The embed index to load. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$fetchEmbeds` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fetchEmbeds[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$fetchEmbeds[123456789012345678;123456789012345678;5]
```

## Reference implementation (source)

Taken from `src/native/message/fetchEmbeds.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        msg ??= ctx.message!
        const embeds = msg?.embeds
        
        if (embeds === undefined)
            return this.success()
        
        if (typeof index === "number") {
            const embed = embeds[index]
            if (!embed)
                return this.success()
            ctx.container.embeds.push(EmbedBuilder.from(embed))
            return this.success()
        }

        ctx.container.embeds.push(...embeds.map(x => EmbedBuilder.from(x)))
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$fetchEmbed`, `$cloneEmbed`, `$cloneEmbeds` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`index`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/fetchEmbeds.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/fetchEmbeds.ts)
