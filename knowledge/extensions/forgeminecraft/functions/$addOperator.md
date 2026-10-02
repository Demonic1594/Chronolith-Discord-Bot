# $addOperator

> Adds a player to the server's operator list, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$addOperator[player;level;bypass]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `player` | `String` | **yes** | no | The player to add as an operator |
| 2 | `level` | `Number` | no | no | The operator permission level to grant (from 1 to 4, with 4 being the highest) |
| 3 | `bypass` | `Boolean` | no | no | Whether the operator bypasses the player limit |

### Per-parameter notes

- **`player`** (`String`, required): The player to add as an operator. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`level`** (`Number`, optional): The operator permission level to grant (from 1 to 4, with 4 being the highest). Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`bypass`** (`Boolean`, optional): Whether the operator bypasses the player limit. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$addOperator` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$addOperator[value]
```

**Full form (all arguments)**

```fs
$addOperator[value;5;true]
```

## Reference implementation (source)

Taken from `src/native/management/addOperator.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(
            await ctx.client.minecraft.server?.operatorList().add(
                parsePlayer(player),
                level || undefined,
                typeof(bypass) === "boolean" ? bypass : undefined
            ).catch(ctx.noop)
        ))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`level`, `bypass`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addAllowList`]($addAllowList.md)
- [`$addIPBan`]($addIPBan.md)
- [`$addPlayerBan`]($addPlayerBan.md)
- [`$clearAllowList`]($clearAllowList.md)
- [`$clearIPBans`]($clearIPBans.md)
- [`$clearOperators`]($clearOperators.md)
- [`$clearPlayerBans`]($clearPlayerBans.md)
- [`$getAllowList`]($getAllowList.md)

**Source:** [`src/native/management/addOperator.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/addOperator.ts)
