# $userReferenceID

> Returns the id of the user this message replies to

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.5.0 | optional | yes | `User` |

## Signature

```fs
$userReferenceID[channel ID;message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to get the message from |
| 2 | `message ID` | `Message` | **yes** | no | The message to get its reference user |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to get the message from. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`message ID`** (`Message`, required): The message to get its reference user. Expects a message ID. Fetched from the channel resolved by the `pointer` argument or the context channel.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userReferenceID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$userReferenceID[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/user/userReferenceID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        channel ??= ctx.channel!
        const msg = (message ?? ctx.message)?.reference?.messageId
        return this.success(msg ? (await (channel as TextBasedChannel).messages.fetch(msg as MessageResolvable)).author.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$authorID`]($authorID.md)
- [`$deleteDM`]($deleteDM.md)
- [`$discriminator`]($discriminator.md)
- [`$isBot`]($isBot.md)
- [`$isBotVerified`]($isBotVerified.md)
- [`$isUserDMEnabled`]($isUserDMEnabled.md)
- [`$randomUserID`]($randomUserID.md)
- [`$sendDM`]($sendDM.md)

**Source:** [`src/native/user/userReferenceID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/userReferenceID.ts)
