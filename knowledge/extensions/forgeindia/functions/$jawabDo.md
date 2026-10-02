# $jawabDo

> Marks the response as a reply

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `message` | v1.0.0 | optional | yes | — |

> aliases: $bolWapas, $replyKaro, $uttarDo

## Signature

```fs
$jawabDo[channel ID;message ID;disable ping]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel the message is at |
| 2 | `message ID` | `Message` | **yes** | no | The message to reply to |
| 3 | `disable ping` | `Boolean` | no | no | Whether to disable ping of reply |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel the message is at. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to reply to. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`disable ping`** (`Boolean`, optional): Whether to disable ping of reply. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$jawabDo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$jawabDo[123456789012345678;123456789012345678]
```

**Full form (all arguments)**

```fs
$jawabDo[123456789012345678;123456789012345678;true]
```

## Quirks & gotchas

1. Callable by its aliases too: `$bolWapas`, `$replyKaro`, `$uttarDo` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Optional arguments (`disable ping`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
6. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
7. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$msgReactionAddKaro`]($msgReactionAddKaro.md)
- [`$msgHatao`]($msgHatao.md)
- [`$msgID`]($msgID.md)
