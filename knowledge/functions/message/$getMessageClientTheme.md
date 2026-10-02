# $getMessageClientTheme

> Retrieves the shared client theme sent with a message

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `message` | v2.7.0 | required | yes | `Unknown` |

## Signature

```fs
$getMessageClientTheme[channel ID;message ID;property;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to get the message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to get its client theme |
| 3 | `property` | `Enum` | **yes** | no | The property to pull |
| 4 | `separator` | `String` | no | no | The separator to use in case of array |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to get the message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to get its client theme. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.
- **`property`** (`Enum`, required): The property to pull. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use in case of array. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Message functions read, send, edit, delete, pin, react to and await messages.

`$getMessageClientTheme` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$getMessageClientTheme[123456789012345678;123456789012345678;value]
```

**Full form (all arguments)**

```fs
$getMessageClientTheme[123456789012345678;123456789012345678;value;,]
```

## Reference implementation (source)

Taken from `src/native/message/getMessageClientTheme.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const theme = (message ?? ctx.message)?.sharedClientTheme
        return this.success(ClientThemeProperties[prop](theme, sep))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Output type is `Unknown` (undocumented) — inspect the reference implementation above to see what it actually returns.
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

**Source:** [`src/native/message/getMessageClientTheme.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/message/getMessageClientTheme.ts)
