# $pageBoard

> Loads a paginated leaderboard slice into the environment variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `board` | v3.0.0 | required | yes | — |

## Signature

```fs
$pageBoard[variable;new;page;max]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | Source environment variable name |
| 2 | `new` | `String` | **yes** | no | Target environment variable name |
| 3 | `page` | `Number` | **yes** | no | Page number |
| 4 | `max` | `Number` | **yes** | no | Number of leaders per page |

### Per-parameter notes

- **`variable`** (`String`, required): Source environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`new`** (`String`, required): Target environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`page`** (`Number`, required): Page number. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`max`** (`Number`, required): Number of leaders per page. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.

## How it works

See the function list below for exact signatures.

`$pageBoard` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$pageBoard[value;value;5;5]
```

## Reference implementation (source)

Taken from `src/functions/board/pageBoard.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        const json = ctx.getEnvironmentKey(variable);
        const start = (page - 1) * max;
        const items = json.items.slice(start, start + max);
        const total = Math.ceil(json.items.length / max);
        ctx.setEnvironmentKey(newe, {
            items,
            count: items.length,
            type: json.type,
            page: {
                current: page,
                total: total
            },
            position: items.length > 0 ? {
                start: start + 1,
                end: start + items.length
            } : {
                start: 0,
                end: 0
            },
            disabled: total > 0 ? {
                first: page <= 2,
                prev: page <= 1,
                next: page >= total,
                last: page >= total - 1
            } : {
                first: true,
                prev: true,
                next: true,
                last: true
            }
        });
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
3. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$leaderBoard`]($leaderBoard.md)
- [`$nearbyBoard`]($nearbyBoard.md)
- [`$positionBoard`]($positionBoard.md)

**Source:** [`src/functions/board/pageBoard.js`](https://github.com/quoriel/db/blob/main/src/functions/board/pageBoard.js)
