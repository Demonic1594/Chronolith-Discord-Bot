# $setStatus

> Sets the client's status

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `bot` | v1.0.0 | required | yes | — |

> aliases: $setBotStatus, $setClientStatus

## Signature

```fs
$setStatus[presence;type;name;state;url]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `presence` | `String` | **yes** | no | The presence status |
| 2 | `type` | `Enum` | **yes** | no | The activity type |
| 3 | `name` | `String` | **yes** | no | The status name |
| 4 | `state` | `String` | no | no | The status state |
| 5 | `url` | `String` | no | no | The url to use for the stream |

### Per-parameter notes

- **`presence`** (`String`, required): The presence status. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`Enum`, required): The activity type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`name`** (`String`, required): The status name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`state`** (`String`, optional): The status state. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`url`** (`String`, optional): The url to use for the stream. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$setStatus` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$setStatus[value;value;name]
```

**Full form (all arguments)**

```fs
$setStatus[value;value;name;value;https://example.com]
```

## Reference implementation (source)

Taken from `src/native/bot/setStatus.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.client.user.setPresence({
            activities: [
                {
                    name,
                    state: state || undefined,
                    type,
                    url: url || undefined,
                },
            ],
            status: status.toLowerCase() as PresenceStatusData,
        })
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$setBotStatus`, `$setClientStatus` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`state`, `url`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$applicationCommandCount`]($applicationCommandCount.md)
- [`$applicationCommands`]($applicationCommands.md)
- [`$botCount`]($botCount.md)
- [`$botCustomInvite`]($botCustomInvite.md)
- [`$botDescription`]($botDescription.md)
- [`$botDestroy`]($botDestroy.md)
- [`$botID`]($botID.md)
- [`$botInvite`]($botInvite.md)

**Source:** [`src/native/bot/setStatus.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/bot/setStatus.ts)
