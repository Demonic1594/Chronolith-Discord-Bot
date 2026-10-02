# $userIDs

> Returns all the users that are currently cached

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.4.0 | optional | yes | `User[]` |

## Signature

```fs
$userIDs[separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `separator` | `String` | no | no | The separator to use for every id |

### Per-parameter notes

- **`separator`** (`String`, optional): The separator to use for every id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userIDs` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$userIDs[,]
```

## Reference implementation (source)

Taken from `src/native/user/userIDs.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.client.users.cache.map(x => x.id).join(sep ?? ", "))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
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

**Source:** [`src/native/user/userIDs.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/userIDs.ts)
