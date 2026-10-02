# $truncateFile

> Truncates text in a file to given length

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `file` | v1.0.0 | required | yes | — |

## Signature

```fs
$truncateFile[path;length]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `path` | `String` | **yes** | no | The path to the file |
| 2 | `length` | `Number` | **yes** | no | The new length for the file |

### Per-parameter notes

- **`path`** (`String`, required): The path to the file. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`length`** (`Number`, required): The new length for the file. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

File functions attach files to the outgoing message container (local paths, URLs or buffers).

`$truncateFile` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$truncateFile[value;5]
```

## Reference implementation (source)

Taken from `src/native/file/truncateFile.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        truncateSync(path, data)
        return this.success()
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$appendFile`]($appendFile.md)
- [`$copyFile`]($copyFile.md)
- [`$deleteFile`]($deleteFile.md)
- [`$fileAccessedAt`]($fileAccessedAt.md)
- [`$fileBlockCount`]($fileBlockCount.md)
- [`$fileBlockSize`]($fileBlockSize.md)
- [`$fileChangedAt`]($fileChangedAt.md)
- [`$fileCreatedAt`]($fileCreatedAt.md)

**Source:** [`src/native/file/truncateFile.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/file/truncateFile.ts)
