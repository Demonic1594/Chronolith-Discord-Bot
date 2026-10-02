# $readDir

> Reads the contents of a directory

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `file` | v1.5.0 | required | yes | `Json`, `String[]` |

## Signature

```fs
$readDir[path;separator;encoding]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `path` | `String` | **yes** | no | The path to the directory |
| 2 | `separator` | `String` | no | no | The separator to use for each result |
| 3 | `encoding` | `String` | no | no | The encoding to use for the result |

### Per-parameter notes

- **`path`** (`String`, required): The path to the directory. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator to use for each result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`encoding`** (`String`, optional): The encoding to use for the result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

File functions attach files to the outgoing message container (local paths, URLs or buffers).

`$readDir` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$readDir[value]
```

**Full form (all arguments)**

```fs
$readDir[value;,;value]
```

## Reference implementation (source)

Taken from `src/native/file/readDir.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        const dirs = readdirSync(path, { encoding: (encoding as BufferEncoding) || "utf-8" })
        if (sep) return this.success(dirs?.join(sep))
        return this.successJSON(dirs)
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`, `encoding`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$appendFile`]($appendFile.md)
- [`$copyFile`]($copyFile.md)
- [`$deleteFile`]($deleteFile.md)
- [`$fileAccessedAt`]($fileAccessedAt.md)
- [`$fileBlockCount`]($fileBlockCount.md)
- [`$fileBlockSize`]($fileBlockSize.md)
- [`$fileChangedAt`]($fileChangedAt.md)
- [`$fileCreatedAt`]($fileCreatedAt.md)

**Source:** [`src/native/file/readDir.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/file/readDir.ts)
