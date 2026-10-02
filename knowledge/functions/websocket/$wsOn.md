# $wsOn

> Attach a listener to a websocket

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `websocket` | v1.5.0 | required | no | — |

> aliases: $websocketOn

## Signature

```fs
$wsOn[websocket ID;listener name;callback;params]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `websocket ID` | `Number` | **yes** | no | The id of the websocket to attach this listener to |
| 2 | `listener name` | `String` | **yes** | no | The name of the event to listen to |
| 3 | `callback` | `String` | **yes** | no | The code to execute every time this event is fired |
| 4 | `params` | `String` | **yes** | yes | The arguments that will contain the data of the event that was sent |

### Per-parameter notes

- **`websocket ID`** (`Number`, required): The id of the websocket to attach this listener to. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`listener name`** (`String`, required): The name of the event to listen to. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`callback`** (`String`, required): The code to execute every time this event is fired. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`params`** (`String` , rest, required): The arguments that will contain the data of the event that was sent. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Websocket functions open and manage custom websocket connections.

`$wsOn` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `params` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$wsOn[5;name;value;value]
```

## Reference implementation (source)

Taken from `src/native/websocket/wsOn.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const { args, return: rt } = await this["resolveMultipleArgs"](ctx, 0, 1, 3) 
        if (!this["isValidReturnType"](rt)) return rt

        const [ id, listener, params ] = args
        const ws = ctx.client.websockets.get(id)
        const code = this.data.fields![2] as IExtendedCompiledFunctionField

        if (ws) {
            ws.on(listener, async (...args) => {
                for (let i = 0, len = args.length;i < len;i++) {
                    const arg = args[i]
                    const param = params[i]
                    if (!param)
                        break
                    ctx.setEnvironmentKey(param, arg instanceof Buffer ? parseJSON(arg.toString("utf-8")) : arg)
                }

                // We cannot stop this...
                await this["resolveCode"](ctx, code)
            })
        }

        return this.success()
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$websocketOn` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$ws`]($ws.md)
- [`$wsClose`]($wsClose.md)
- [`$wsSend`]($wsSend.md)
- [`$wsState`]($wsState.md)

**Source:** [`src/native/websocket/wsOn.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/websocket/wsOn.ts)
