# $key

> Builds a composite key

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `other` | v2.0.0 | required | yes | `String` |

## Signature

```fs
$key[type;entity;guild]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `type` | `String` | **yes** | no | Data type |
| 2 | `entity` | `String` | no | no | Entity identifier |
| 3 | `guild` | `Guild` | no | no | Guild identifier |

### Per-parameter notes

- **`type`** (`String`, required): Data type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`entity`** (`String`, optional): Entity identifier. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`guild`** (`Guild`, optional): Guild identifier. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

Uncategorized utilities.

`$key` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$key[value]
```

**Full form (all arguments)**

```fs
$key[value;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/other/key.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        return this.success(makeKey(ctx, type, entity, guild?.id));
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`entity`, `guild`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$hold`]($hold.md)

**Source:** [`src/functions/other/key.js`](https://github.com/quoriel/db/blob/main/src/functions/other/key.js)
