# $mktdir

> Creates a temporary directory

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `file` | v1.4.0 | required | yes | `String` |

> aliases: $makeTempDir, $createTempDir

## Signature

```fs
$mktdir[prefix]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `prefix` | `String` | **yes** | no | The prefix for the temp dir |

### Per-parameter notes

- **`prefix`** (`String`, required): The prefix for the temp dir. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

File functions attach files to the outgoing message container (local paths, URLs or buffers).

`$mktdir` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$mktdir[!]
```

## Reference implementation (source)

Taken from `src/native/file/mktdir.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(mkdtempSync(prefix))
}
```

## Quirks & gotchas

1. Callable by its aliases too: `$makeTempDir`, `$createTempDir` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
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

**Source:** [`src/native/file/mktdir.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/file/mktdir.ts)
