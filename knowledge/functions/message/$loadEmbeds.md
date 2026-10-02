# $loadEmbeds

> Loads embed json (or array) to the response

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v1.4.0 | required | yes | — |

> aliases: $loadEmbed

## Signature

```fs
$loadEmbeds[embed data]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `embed data` | `Json` | **yes** | no | The embed object or array of objects to load |

### Per-parameter notes

- **`embed data`** (`Json`, required): The embed object or array of objects to load. Expects a JSON string. Parsed with ForgeScript's lenient `parseJSON`; invalid JSON is rejected.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$loadEmbeds` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$loadEmbeds[{"key":"value"}]
```

## Reference implementation (source)

Taken from `src/native/message/loadEmbeds.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (Array.isArray(json)) {
            ctx.container.embeds.push(...json.map(x => EmbedBuilder.from(x as APIEmbed)))
        } else {
            ctx.container.embeds.push(EmbedBuilder.from(json as APIEmbed))
        }

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$loadEmbed` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addMessageReactions`]($addMessageReactions.md)
- [`$attachment`]($attachment.md)
- [`$deleteAllMessageReactions`]($deleteAllMessageReactions.md)
- [`$deleteIn`]($deleteIn.md)
- [`$deleteMessage`]($deleteMessage.md)
- [`$deleteUserMessageReaction`]($deleteUserMessageReaction.md)
- [`$editMessage`]($editMessage.md)
- [`$fetchComponents`]($fetchComponents.md)

**Source:** [`src/native/message/loadEmbeds.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/loadEmbeds.ts)
