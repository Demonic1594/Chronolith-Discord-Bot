# $mentioned

> Returns the mentioned users

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `mention` | v1.0.0 | optional | yes | `User[]` |

## Signature

```fs
$mentioned[index;return author]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `index` | `Number` | **yes** | no | The index of the user |
| 2 | `return author` | `Boolean` | no | no | Return author ID if not found |

### Per-parameter notes

- **`index`** (`Number`, required): The index of the user. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`return author`** (`Boolean`, optional): Return author ID if not found. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Mention functions build mention strings (users, roles, channels, timestamps `<t:...>`).

`$mentioned` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$mentioned[5]
```

**Full form (all arguments)**

```fs
$mentioned[5;true]
```

## Reference implementation (source)

Taken from `src/native/mention/mentioned.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const id: string | undefined = this.hasFields
            ? ctx.message?.mentions.users.at(i)?.id
            : ctx.message?.mentions.users.map((x) => x.id).join(", ")
        return this.success(id ?? (rt ? ctx.user?.id : undefined))
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`return author`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
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

**Source:** [`src/native/mention/mentioned.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/mention/mentioned.ts)
