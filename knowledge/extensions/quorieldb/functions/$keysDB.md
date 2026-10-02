# $keysDB

> Retrieves all keys from the database

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `db` | v3.0.0 | required | yes | `String` |

## Signature

```fs
$keysDB[type;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | **yes** | no | Data type |
| 2 | `separator` | `String` | no | no | The separator |

### Per-parameter notes

- **`type`** (`String`, required): Data type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`separator`** (`String`, optional): The separator. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$keysDB` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$keysDB[value]
```

**Full form (all arguments)**

```fs
$keysDB[value;,]
```

## Reference implementation (source)

Taken from `src/functions/db/keysDB.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(keysDB(type).join(separator || ", "));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$activeDB`]($activeDB.md)
- [`$closeDB`]($closeDB.md)
- [`$openDB`]($openDB.md)
- [`$pingDB`]($pingDB.md)
- [`$prefetchDB`]($prefetchDB.md)
- [`$rangeDB`]($rangeDB.md)
- [`$reloadDB`]($reloadDB.md)
- [`$searchDB`]($searchDB.md)

**Source:** [`src/functions/db/keysDB.js`](https://github.com/quoriel/db/blob/main/src/functions/db/keysDB.js)
