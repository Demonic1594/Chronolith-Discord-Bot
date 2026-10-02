# $searchDB

> Searches the database with various filters

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `db` | v3.0.0 | optional | yes | `Json` |

## Signature

```fs
$searchDB[type;name;valueType;value;entity;guild]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | no | no | Data type (if not specified, searches all open databases) |
| 2 | `name` | `String` | no | no | Variable name to search for |
| 3 | `valueType` | `Enum` | no | no | Filter by value type |
| 4 | `value` | `String` | no | no | Filter by actual value |
| 5 | `entity` | `String` | no | no | Entity identifier |
| 6 | `guild` | `Guild` | no | no | Guild identifier |

### Per-parameter notes

- **`type`** (`String`, optional): Data type (if not specified, searches all open databases). Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, optional): Variable name to search for. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`valueType`** (`Enum`, optional): Filter by value type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`value`** (`String`, optional): Filter by actual value. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`entity`** (`String`, optional): Entity identifier. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild`** (`Guild`, optional): Guild identifier. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

See the function list below for exact signatures.

`$searchDB` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$searchDB[value]
```

**Full form (all arguments)**

```fs
$searchDB[value;name;value;value;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/db/searchDB.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        return this.successJSON(searchDB(type, name, valueType, value, entity, guild ? guild?.id || ctx.guild.id : null));
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Optional arguments (`type`, `name`, `valueType`, `value`, `entity`, `guild`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$activeDB`]($activeDB.md)
- [`$closeDB`]($closeDB.md)
- [`$keysDB`]($keysDB.md)
- [`$openDB`]($openDB.md)
- [`$pingDB`]($pingDB.md)
- [`$prefetchDB`]($prefetchDB.md)
- [`$rangeDB`]($rangeDB.md)
- [`$reloadDB`]($reloadDB.md)

**Source:** [`src/functions/db/searchDB.js`](https://github.com/quoriel/db/blob/main/src/functions/db/searchDB.js)
