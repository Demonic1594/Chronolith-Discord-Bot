# $isUserDMEnabled

> Checks whether the given user can be DMed

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.2.0 | optional | yes | `Boolean` |

## Signature

```fs
$isUserDMEnabled[user]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user` | `User` | **yes** | no | The user to test DMs |

### Per-parameter notes

- **`user`** (`User`, required): The user to test DMs. Expects a user ID. Must be a 16-23 digit snowflake; fetched via `client.users.fetch`.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$isUserDMEnabled` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$isUserDMEnabled[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/user/isUserDMEnabled.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        user ??= ctx.user!
        return this.success(
            !!(await user?.send("").catch((err) => (err instanceof DiscordAPIError && Number(err.code) === 50006)))
        )
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
- [`$randomUserID`]($randomUserID.md)
- [`$sendDM`]($sendDM.md)
- [`$userAccentColor`]($userAccentColor.md)

**Source:** [`src/native/user/isUserDMEnabled.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/isUserDMEnabled.ts)
