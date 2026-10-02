# $bufferResize

> Resizes a buffer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `buffer` | v1.1.0 | required | yes | — |

## Signature

```fs
$bufferResize[variable name;length]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable name` | `String` | **yes** | no | The variable the buffer is allocated on |
| 2 | `length` | `Number` | **yes** | no | The new length for this buffer |

### Per-parameter notes

- **`variable name`** (`String`, required): The variable the buffer is allocated on. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`length`** (`Number`, required): The new length for this buffer. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

Buffer functions build and transform binary buffers (Node `Buffer`), typically for file attachments and canvas workflows.

`$bufferResize` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$bufferResize[name;5]
```

## Reference implementation (source)

Taken from `src/native/buffer/bufferResize.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const buffer = ctx.getEnvironmentInstance(Buffer, name)
        if (buffer !== null) {
            const ref = Buffer.alloc(length)
            buffer.copy(new Uint8Array(ref), 0, 0, ref.length)
            ctx.setEnvironmentKey(name, ref)
        }
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bufferAlloc`]($bufferAlloc.md)
- [`$bufferAllocUnsafe`]($bufferAllocUnsafe.md)
- [`$bufferLength`]($bufferLength.md)
- [`$bufferReadInt32`]($bufferReadInt32.md)
- [`$bufferReadUtf8`]($bufferReadUtf8.md)
- [`$bufferToString`]($bufferToString.md)
- [`$bufferWriteInt32`]($bufferWriteInt32.md)
- [`$bufferWriteUtf8`]($bufferWriteUtf8.md)

**Source:** [`src/native/buffer/bufferResize.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/buffer/bufferResize.ts)
