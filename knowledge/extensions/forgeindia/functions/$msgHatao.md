# $msgHatao

> Deletes given messages, returns the count of messages deleted

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `message` | v1.0.0 | required | yes | `Number` |

> aliases: $deleteMsg, $hataDoMsg

## Signature

```fs
$msgHatao[channel ID;messages]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to delete this message from |
| 2 | `messages` | `String` | **yes** | yes | The message ids to delete |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to delete this message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`messages`** (`String` , rest, required): The message ids to delete. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$msgHatao` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `messages` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$msgHatao[123456789012345678;Hello!]
```

## Quirks & gotchas

1. Callable by its aliases too: `$deleteMsg`, `$hataDoMsg` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$msgReactionAddKaro`]($msgReactionAddKaro.md)
- [`$msgID`]($msgID.md)
- [`$jawabDo`]($jawabDo.md)
