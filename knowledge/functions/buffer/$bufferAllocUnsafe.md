# $bufferAllocUnsafe

> Unsafely allocates given number of bytes in a buffer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `buffer` | v1.1.0 | required | yes | — |

## Signature

```fs
$bufferAllocUnsafe[variable name;bytes]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable name` | `String` | **yes** | no | The variable to load it to, accessed with $env[<name>] |
| 2 | `bytes` | `Number` | **yes** | no | The number of bytes to alloc |

### Per-parameter notes

- **`variable name`** (`String`, required): The variable to load it to, accessed with $env[<name>]. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`bytes`** (`Number`, required): The number of bytes to alloc. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Buffer functions build and transform binary buffers (Node `Buffer`), typically for file attachments and canvas workflows.

`$bufferAllocUnsafe` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$bufferAllocUnsafe[name;5]
```

## Reference implementation (source)

Taken from `src/native/buffer/bufferAllocUnsafe.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(void ctx.setEnvironmentKey(name, Buffer.allocUnsafe(bytes)))
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bufferAlloc`]($bufferAlloc.md)
- [`$bufferLength`]($bufferLength.md)
- [`$bufferReadInt32`]($bufferReadInt32.md)
- [`$bufferReadUtf8`]($bufferReadUtf8.md)
- [`$bufferResize`]($bufferResize.md)
- [`$bufferToString`]($bufferToString.md)
- [`$bufferWriteInt32`]($bufferWriteInt32.md)
- [`$bufferWriteUtf8`]($bufferWriteUtf8.md)

**Source:** [`src/native/buffer/bufferAllocUnsafe.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/buffer/bufferAllocUnsafe.ts)
