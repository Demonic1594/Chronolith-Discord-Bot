# $wsState

> Returns a websocket's connection state

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `websocket` | v1.5.0 | required | yes | `ConnectionState` |

## Signature

```fs
$wsState[websocket ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `websocket ID` | `Number` | **yes** | no | The websocket to get its state |

### Per-parameter notes

- **`websocket ID`** (`Number`, required): The websocket to get its state. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Websocket functions open and manage custom websocket connections.

`$wsState` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$wsState[5]
```

## Reference implementation (source)

Taken from `src/native/websocket/wsState.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const ws = ctx.client.websockets.get(id)
        return this.success(ConnectionState[ws?.readyState!])
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ws`]($ws.md)
- [`$wsClose`]($wsClose.md)
- [`$wsOn`]($wsOn.md)
- [`$wsSend`]($wsSend.md)

**Source:** [`src/native/websocket/wsState.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/websocket/wsState.ts)
