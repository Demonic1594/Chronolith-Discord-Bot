# $messageEmojis

> Retrieves all emojis of this message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v2.4.0 | optional | yes | `Emoji[]` |

## Signature

```fs
$messageEmojis[channel ID;message ID;separator;return ids]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to pull message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to get its emojis |
| 3 | `separator` | `String` | no | no | The separator to use for every emoji |
| 4 | `return ids` | `Boolean` | no | no | Whether to return the emoji ids, excludes unicode emojis |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to pull message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to get its emojis. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`separator`** (`String`, optional): The separator to use for every emoji. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return ids`** (`Boolean`, optional): Whether to return the emoji ids, excludes unicode emojis. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$messageEmojis` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$messageEmojis[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$messageEmojis[123456789012345678;123456789012345678;,;true]
```

## Reference implementation (source)

Taken from `src/native/message/messageEmojis.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success([...(message ?? ctx.message)?.content.matchAll(EmojiRegex) ?? []].map((x) => x[returnIDs ? 1 : 0]).filter(Boolean).join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`, `return ids`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
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

**Source:** [`src/native/message/messageEmojis.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/messageEmojis.ts)
