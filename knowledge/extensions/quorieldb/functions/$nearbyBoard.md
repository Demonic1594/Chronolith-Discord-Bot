# $nearbyBoard

> Shows the count of competitors before and after the entity in the leaderboard

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `board` | v3.0.0 | required | yes | `Json` |

## Signature

```fs
$nearbyBoard[variable;entity]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | Source environment variable name |
| 2 | `entity` | `String` | no | no | Entity identifier |

### Per-parameter notes

- **`variable`** (`String`, required): Source environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`entity`** (`String`, optional): Entity identifier. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

See the function list below for exact signatures.

`$nearbyBoard` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$nearbyBoard[value]
```

**Full form (all arguments)**

```fs
$nearbyBoard[value;value]
```

## Reference implementation (source)

Taken from `src/functions/board/nearbyBoard.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        const json = ctx.getEnvironmentKey(variable);
        if (!entity) {
            if (json.type === null) return this.successJSON([0, 0]);
            entity = ctx[json.type]?.id;
        }
        let index = -1;
        for (let i = 0, l = json.items.length; i < l; i++) {
            if (json.items[i].key === entity) {
                index = i;
                break;
            }
        }
        if (index === -1) return this.successJSON([0, 0]);
        const after = json.items.length - index - 1;
        return this.successJSON([index, after]);
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`entity`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$leaderBoard`]($leaderBoard.md)
- [`$pageBoard`]($pageBoard.md)
- [`$positionBoard`]($positionBoard.md)

**Source:** [`src/functions/board/nearbyBoard.js`](https://github.com/quoriel/db/blob/main/src/functions/board/nearbyBoard.js)
