# $sendDM

> Sends a DM to the user

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.0 | required | yes | `Message` |

## Signature

```fs
$sendDM[user ID;content;return message ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `User` | **yes** | no | The user to direct message |
| 2 | `content` | `String` | no | no | The content to send |
| 3 | `return message ID` | `Boolean` | no | no | Whether to return the id of the newly created message |

### Per-parameter notes

- **`user ID`** (`User`, required): The user to direct message. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.
- **`content`** (`String`, optional): The content to send. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return message ID`** (`Boolean`, optional): Whether to return the id of the newly created message. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$sendDM` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$sendDM[123456789012345678]
```

**Full form (all arguments)**

```fs
$sendDM[123456789012345678;Hello!;true]
```

## Reference implementation (source)

Taken from `src/native/user/sendDM.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.container.content = content || undefined
        const msg = await ctx.container.send<Message<true>>(user)
        return this.success(returnMessageID ? msg?.id : undefined)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`content`, `return message ID`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$authorID`]($authorID.md)
- [`$deleteDM`]($deleteDM.md)
- [`$discriminator`]($discriminator.md)
- [`$isBot`]($isBot.md)
- [`$isBotVerified`]($isBotVerified.md)
- [`$isUserDMEnabled`]($isUserDMEnabled.md)
- [`$randomUserID`]($randomUserID.md)
- [`$userAccentColor`]($userAccentColor.md)

## Community guides covering this function

- [$sendDM guide](../../guides/guide-134.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-134)

**Source:** [`src/native/user/sendDM.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/sendDM.ts)
