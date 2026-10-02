# $wsClose

> Closes a websocket connection and removes all listeners of it

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `websocket` | v1.5.0 | required | yes | — |

> aliases: $websocketClose

## Signature

```fs
$wsClose[websocket ID;code]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `websocket ID` | `Number` | **yes** | no | The id of the websocket to attach this listener to |
| 2 | `code` | `Number` | no | no | The status code to send |

### Per-parameter notes

- **`websocket ID`** (`Number`, required): The id of the websocket to attach this listener to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`code`** (`Number`, optional): The status code to send. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Websocket functions open and manage custom websocket connections.

`$wsClose` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$wsClose[5]
```

**Full form (all arguments)**

```fs
$wsClose[5;5]
```

## Reference implementation (source)

Taken from `src/native/websocket/wsClose.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ws = ctx.client.websockets.get(id)
        if (ws)
            ws.close(code ?? undefined)
        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$websocketClose` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`code`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ws`]($ws.md)
- [`$wsOn`]($wsOn.md)
- [`$wsSend`]($wsSend.md)
- [`$wsState`]($wsState.md)

**Source:** [`src/native/websocket/wsClose.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/websocket/wsClose.ts)
