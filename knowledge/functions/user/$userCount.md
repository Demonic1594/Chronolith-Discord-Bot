# $userCount

> Returns the user count of the bot

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.0 | none | no | `Number` |

## Signature

```fs
$userCount
```

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userCount` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$userCount
```

## Reference implementation (source)

Taken from `src/native/user/userCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.client.guilds.cache.reduce((x, y) => x + (y.memberCount || 0), 0))
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
- [`$randomUserID`]($randomUserID.md)
- [`$sendDM`]($sendDM.md)

## Community guides covering this function

- [$userCount guide](../../guides/guide-168.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-168)

**Source:** [`src/native/user/userCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/userCount.ts)
