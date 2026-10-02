# $onlyForRoles

> Only executes code if user has given roles

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `limiter` | v1.1.0 | required | no | — |

## Signature

```fs
$onlyForRoles[code;roles]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to execute if user does not meet the roles |
| 2 | `roles` | `Role` | **yes** | yes | The roles to check for |

### Per-parameter notes

- **`code`** (`String`, required): The code to execute if user does not meet the roles. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`roles`** (`Role` , rest, required): The roles to check for. Expects a role ID. Looked up in the guild resolved by the `pointer` argument or the context guild.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Limiter functions restrict execution (`$onlyIf`, `$onlyForUsers`, `$onlyForRoles`, ...) and early-exit a command via `$stop`.

`$onlyForRoles` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `roles` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$onlyForRoles[code;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/limiter/onlyForRoles.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const code = this.data.fields![0] as IExtendedCompiledFunctionField
        let ok = false

        if (ctx.guild) {
            const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 1)
            if (!this["isValidReturnType"](rt)) return rt
            ok = ctx.member?.roles.cache.hasAny(...args[0].map(x => x.id)) ?? false
        }

        if (!ok)
            return this["fail"](ctx, code)

        return this.success()
}
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$onlyForCategories`]($onlyForCategories.md)
- [`$onlyForChannels`]($onlyForChannels.md)
- [`$onlyForGuilds`]($onlyForGuilds.md)
- [`$onlyForUsers`]($onlyForUsers.md)
- [`$onlyIf`]($onlyIf.md)
- [`$stop`]($stop.md)

**Source:** [`src/native/limiter/onlyForRoles.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/limiter/onlyForRoles.ts)
