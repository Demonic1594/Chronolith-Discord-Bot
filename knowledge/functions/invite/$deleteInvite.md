# $deleteInvite

> Deletes an invite, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `invite` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$deleteInvite[code;reason]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The invite code |
| 2 | `reason` | `String` | no | no | The reason for deleting the invite |

### Per-parameter notes

- **`code`** (`String`, required): The invite code. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`reason`** (`String`, optional): The reason for deleting the invite. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Invite functions create, inspect and delete guild invites.

`$deleteInvite` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$deleteInvite[code]
```

**Full form (all arguments)**

```fs
$deleteInvite[code;value]
```

## Reference implementation (source)

Taken from `src/native/invite/deleteInvite.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const invite = await ctx.client.fetchInvite(code).catch(ctx.noop)
        return this.success(!!(await invite?.delete(reason || ctx.reason).catch(ctx.noop)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`reason`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$getInvite`]($getInvite.md)
- [`$inviteExists`]($inviteExists.md)
- [`$inviterCode`]($inviterCode.md)
- [`$inviterID`]($inviterID.md)

**Source:** [`src/native/invite/deleteInvite.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/invite/deleteInvite.ts)
