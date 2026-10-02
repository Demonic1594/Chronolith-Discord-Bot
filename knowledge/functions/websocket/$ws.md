# $ws

> Creates a WebSocket connection to a server

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `websocket` | v1.5.0 | required | yes | `Number` |

> aliases: $websocket

## Signature

```fs
$ws[host]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `host` | `String` | **yes** | no | The WS host, formatted as wss://hostname:port |

### Per-parameter notes

- **`host`** (`String`, required): The WS host, formatted as wss://hostname:port. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Websocket functions open and manage custom websocket connections.

`$ws` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$ws[value]
```

## Reference implementation (source)

Taken from `src/native/websocket/ws.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ws = new WebSocket(host)
        const id = ++IncrementalWebsocketIds

        // PREVENT CRASH
        ws?.on("error", ctx.noop)

        // CLEANUP
        ws?.on("close", () => {
            ctx.client.websockets.delete(id)
            ws.removeAllListeners()
        })

        ctx.client.websockets.set(id, ws)
        return this.success(id)
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$websocket` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$wsClose`]($wsClose.md)
- [`$wsOn`]($wsOn.md)
- [`$wsSend`]($wsSend.md)
- [`$wsState`]($wsState.md)

**Source:** [`src/native/websocket/ws.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/websocket/ws.ts)
