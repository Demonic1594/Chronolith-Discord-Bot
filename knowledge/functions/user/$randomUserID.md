# $randomUserID

> Returns a random user ID

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.3 | none | no | `User` |

## Signature

```fs
$randomUserID
```

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$randomUserID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$randomUserID
```

## Reference implementation (source)

Taken from `src/native/user/randomUserID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.client.users.cache.randomKey())
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$authorID`]($authorID.md)
- [`$deleteDM`]($deleteDM.md)
- [`$discriminator`]($discriminator.md)
- [`$isBot`]($isBot.md)
- [`$isBotVerified`]($isBotVerified.md)
- [`$isUserDMEnabled`]($isUserDMEnabled.md)
- [`$sendDM`]($sendDM.md)
- [`$userAccentColor`]($userAccentColor.md)

## Community guides covering this function

- [$randomUserID guide](../../guides/guide-162.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-162)

**Source:** [`src/native/user/randomUserID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/randomUserID.ts)
