# $mentionedUserCount

> Returns the mentioned user count

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.3.0 | none | no | `Number` |

> aliases: $mentionedUsersCount

## Signature

```fs
$mentionedUserCount
```

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$mentionedUserCount` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$mentionedUserCount
```

## Reference implementation (source)

Taken from `src/native/mention/mentionedUserCount.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(ctx.message?.mentions.users.size)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$mentionedUsersCount` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$disableAllMentions`]($disableAllMentions.md)
- [`$disableEveryoneMention`]($disableEveryoneMention.md)
- [`$disableRoleMentions`]($disableRoleMentions.md)
- [`$disableUserMentions`]($disableUserMentions.md)
- [`$enableAllMentions`]($enableAllMentions.md)
- [`$enableRoleMentions`]($enableRoleMentions.md)
- [`$enableUserMentions`]($enableUserMentions.md)
- [`$isChannelMentioned`]($isChannelMentioned.md)

**Source:** [`src/native/mention/mentionedUserCount.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/mentionedUserCount.ts)
