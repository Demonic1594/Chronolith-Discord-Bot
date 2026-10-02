# $userExists

> Returns whether a user id exists

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `user` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$userExists[user ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `user ID` | `String` | **yes** | no | The user to check |

### Per-parameter notes

- **`user ID`** (`String`, required): The user to check. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$userExists` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$userExists[123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/user/userExists.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(CompiledFunction.IdRegex.test(id) && (await ctx.client.users.fetch(id).catch(() => false)) !== false)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

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

- [$userExists guide](../../guides/guide-179.md) — [docs.botforge.org](https://docs.botforge.org/guide/guide-179)

**Source:** [`src/native/user/userExists.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/user/userExists.ts)
