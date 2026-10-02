# $mentionedRoles

> Returns the mentioned roles

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.0.0 | optional | yes | `Role[]` |

> aliases: $mentionedRole

## Signature

```fs
$mentionedRoles[index]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `index` | `Number` | **yes** | no | The index of the role |

### Per-parameter notes

- **`index`** (`Number`, required): The index of the role. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$mentionedRoles` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$mentionedRoles[5]
```

## Reference implementation (source)

Taken from `src/native/mention/mentionedRoles.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(
            this.hasFields
                ? ctx.message?.mentions.roles.at(i)?.id
                : ctx.message?.mentions.roles.map((x) => x.id).join(", ")
        )
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$mentionedRole` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$disableAllMentions`]($disableAllMentions.md)
- [`$disableEveryoneMention`]($disableEveryoneMention.md)
- [`$disableRoleMentions`]($disableRoleMentions.md)
- [`$disableUserMentions`]($disableUserMentions.md)
- [`$enableAllMentions`]($enableAllMentions.md)
- [`$enableRoleMentions`]($enableRoleMentions.md)
- [`$enableUserMentions`]($enableUserMentions.md)
- [`$isChannelMentioned`]($isChannelMentioned.md)

**Source:** [`src/native/mention/mentionedRoles.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/mentionedRoles.ts)
