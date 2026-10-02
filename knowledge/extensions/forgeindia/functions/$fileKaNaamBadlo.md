# $fileKaNaamBadlo

> Renames a file

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `file` | v1.5.0 | required | yes | — |

## Signature

```fs
$fileKaNaamBadlo[old path;new path]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `old path` | `String` | **yes** | no | The old path to the file |
| 2 | `new path` | `String` | **yes** | no | The new path to the file |

### Per-parameter notes

- **`old path`** (`String`, required): The old path to the file. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new path`** (`String`, required): The new path to the file. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

File functions attach files to the outgoing message container (local paths, URLs or buffers).

`$fileKaNaamBadlo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fileKaNaamBadlo[value;value]
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fileMeinAddKaro`]($fileMeinAddKaro.md)
- [`$fileKiCopyBanao`]($fileKiCopyBanao.md)
- [`$fileDeleteKaro`]($fileDeleteKaro.md)
- [`$fileHaiKya`]($fileHaiKya.md)
- [`$yeFileHaiKya`]($yeFileHaiKya.md)
- [`$filePadho`]($filePadho.md)
- [`$fileMeinLikho`]($fileMeinLikho.md)
