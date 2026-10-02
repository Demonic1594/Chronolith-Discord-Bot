# $authorID

> Retrieves a user's id

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.0 | none | no | `User` |

> aliases: $userID

## Signature

```fs
$authorID
```

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$authorID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$authorID
```

## Reference implementation (source)

Taken from `src/native/user/authorID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.user?.id)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$userID` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$deleteDM`]($deleteDM.md)
- [`$discriminator`]($discriminator.md)
- [`$isBot`]($isBot.md)
- [`$isBotVerified`]($isBotVerified.md)
- [`$isUserDMEnabled`]($isUserDMEnabled.md)
- [`$randomUserID`]($randomUserID.md)
- [`$sendDM`]($sendDM.md)
- [`$userAccentColor`]($userAccentColor.md)

## Community guides covering this function

- [$authorID guide](../../guides/guide-116.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-116)

**Source:** [`src/native/user/authorID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/authorID.ts)
