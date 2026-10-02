# $bufferLength

> Returns the length of a buffer

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `buffer` | v1.1.0 | required | yes | `Number` |

## Signature

```fs
$bufferLength[variable name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable name` | `String` | **yes** | no | The variable the buffer is allocated on |

### Per-parameter notes

- **`variable name`** (`String`, required): The variable the buffer is allocated on. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Buffer functions build and transform binary buffers (Node `Buffer`), typically for file attachments and canvas workflows.

`$bufferLength` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$bufferLength[name]
```

## Reference implementation (source)

Taken from `src/native/buffer/bufferLength.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(void ctx.getEnvironmentInstance(Buffer, name)?.length)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$bufferAlloc`]($bufferAlloc.md)
- [`$bufferAllocUnsafe`]($bufferAllocUnsafe.md)
- [`$bufferReadInt32`]($bufferReadInt32.md)
- [`$bufferReadUtf8`]($bufferReadUtf8.md)
- [`$bufferResize`]($bufferResize.md)
- [`$bufferToString`]($bufferToString.md)
- [`$bufferWriteInt32`]($bufferWriteInt32.md)
- [`$bufferWriteUtf8`]($bufferWriteUtf8.md)

**Source:** [`src/native/buffer/bufferLength.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/buffer/bufferLength.ts)
