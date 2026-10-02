# $moveRecord

> Moves data from one record to another

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `record` | v3.0.0 | required | yes | `Boolean` |

## Signature

```fs
$moveRecord[type;from key;to key;delete source]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | **yes** | no | Data type |
| 2 | `from key` | `String` | **yes** | no | Source record key |
| 3 | `to key` | `String` | **yes** | no | Target record key |
| 4 | `delete source` | `Boolean` | no | no | Whether to delete source record after moving (default: true) |

### Per-parameter notes

- **`type`** (`String`, required): Data type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`from key`** (`String`, required): Source record key. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`to key`** (`String`, required): Target record key. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`delete source`** (`Boolean`, optional): Whether to delete source record after moving (default: true). Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

See the function list below for exact signatures.

`$moveRecord` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$moveRecord[value;value;value]
```

**Full form (all arguments)**

```fs
$moveRecord[value;value;value;true]
```

## Reference implementation (source)

Taken from `src/functions/record/moveRecord.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(await moveRecord(type, fromKey, toKey, deleteSource));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`delete source`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$existsRecord`]($existsRecord.md)
- [`$getRecord`]($getRecord.md)
- [`$putRecord`]($putRecord.md)
- [`$removeRecord`]($removeRecord.md)
- [`$valueRecord`]($valueRecord.md)

**Source:** [`src/functions/record/moveRecord.js`](https://github.com/quoriel/db/blob/main/src/functions/record/moveRecord.js)
