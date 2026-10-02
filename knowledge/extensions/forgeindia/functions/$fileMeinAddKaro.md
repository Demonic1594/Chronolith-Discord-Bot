# $fileMeinAddKaro

> Appends text to a file

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `file` | v1.0.0 | required | yes | — |

## Signature

```fs
$fileMeinAddKaro[path;text;encoding]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `path` | `String` | **yes** | no | The path to the file |
| 2 | `text` | `String` | **yes** | no | The text to append |
| 3 | `encoding` | `String` | no | no | The encoding to use for text |

### Per-parameter notes

- **`path`** (`String`, required): The path to the file. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`text`** (`String`, required): The text to append. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`encoding`** (`String`, optional): The encoding to use for text. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

File functions attach files to the outgoing message container (local paths, URLs or buffers).

`$fileMeinAddKaro` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$fileMeinAddKaro[value;Hello!]
```

**Full form (all arguments)**

```fs
$fileMeinAddKaro[value;Hello!;value]
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`encoding`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$fileKiCopyBanao`]($fileKiCopyBanao.md)
- [`$fileDeleteKaro`]($fileDeleteKaro.md)
- [`$fileHaiKya`]($fileHaiKya.md)
- [`$yeFileHaiKya`]($yeFileHaiKya.md)
- [`$filePadho`]($filePadho.md)
- [`$fileKaNaamBadlo`]($fileKaNaamBadlo.md)
- [`$fileMeinLikho`]($fileMeinLikho.md)
