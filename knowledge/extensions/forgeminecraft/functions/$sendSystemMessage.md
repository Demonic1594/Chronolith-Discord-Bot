# $sendSystemMessage

> Sends a system message to the minecraft server, returns bool

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeMinecraft | `management` | v1.0.0 | required | yes | `Boolean` |

## Signature

```fs
$sendSystemMessage[message;overlay;players]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `message` | `String` | **yes** | no | The message to send |
| 2 | `overlay` | `Boolean` | no | no | Whether to display the message as an overlay above the hotbar, otherwise in chat |
| 3 | `players` | `String` | no | yes | The players receiving the message, omit to send to all players |

### Per-parameter notes

- **`message`** (`String`, required): The message to send. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`overlay`** (`Boolean`, optional): Whether to display the message as an overlay above the hotbar, otherwise in chat. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.
- **`players`** (`String` , rest, optional): The players receiving the message, omit to send to all players. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$sendSystemMessage` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `players` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$sendSystemMessage[Hello!]
```

**Full form (all arguments)**

```fs
$sendSystemMessage[Hello!;true;value]
```

## Reference implementation (source)

Taken from `src/native/management/sendSystemMessage.ts` in the `ForgeMinecraft` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(!!(
            await ctx.client.minecraft.server?.sendSystemMessage(
                msg,
                players?.length ? players.map((x) => parsePlayer(x)) : undefined,
                overlay || undefined
            ).catch(ctx.noop)
        ))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`overlay`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$addAllowList`]($addAllowList.md)
- [`$addIPBan`]($addIPBan.md)
- [`$addOperator`]($addOperator.md)
- [`$addPlayerBan`]($addPlayerBan.md)
- [`$clearAllowList`]($clearAllowList.md)
- [`$clearIPBans`]($clearIPBans.md)
- [`$clearOperators`]($clearOperators.md)
- [`$clearPlayerBans`]($clearPlayerBans.md)

**Source:** [`src/native/management/sendSystemMessage.ts`](https://github.com/tryforge/ForgeMinecraft/blob/main/src/native/management/sendSystemMessage.ts)
