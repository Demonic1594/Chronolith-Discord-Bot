# $msgReactionAddKaro

> Adds reactions to a message, returns amount of emojis successfully reacted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `message` | v1.0.0 | required | yes | `Number` |

> aliases: $emoteLagao, $reactionAdd, $reactionLagao

## Signature

```fs
$msgReactionAddKaro[channel ID;message ID;emojis]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel the message is located |
| 2 | `message ID` | `Message` | **yes** | no | The message to add reactions to |
| 3 | `emojis` | `String` | **yes** | yes | The emojis to react with |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel the message is located. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to add reactions to. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`emojis`** (`String` , rest, required): The emojis to react with. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$msgReactionAddKaro` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `emojis` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$msgReactionAddKaro[123456789012345678;123456789012345678;:smile:]
```

## Quirks & gotchas

1. Callable by its aliases too: `$emoteLagao`, `$reactionAdd`, `$reactionLagao` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$msgHatao`]($msgHatao.md)
- [`$msgID`]($msgID.md)
- [`$jawabDo`]($jawabDo.md)
