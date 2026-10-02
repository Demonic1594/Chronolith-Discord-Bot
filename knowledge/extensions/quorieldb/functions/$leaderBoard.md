# $leaderBoard

> Loads the entire sorted ranked list into the environment variable

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| QuorielDB | `board` | v3.0.0 | required | yes | — |

## Signature

```fs
$leaderBoard[variable;type;name;sorting;guild]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `variable` | `String` | **yes** | no | Environment variable name |
| 2 | `type` | `String` | **yes** | no | Data type |
| 3 | `name` | `String` | **yes** | no | Variable name |
| 4 | `sorting` | `Enum` | no | no | Sorting type |
| 5 | `guild` | `Guild` | no | no | Guild identifier |

### Per-parameter notes

- **`variable`** (`String`, required): Environment variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`type`** (`String`, required): Data type. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`name`** (`String`, required): Variable name. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`sorting`** (`Enum`, optional): Sorting type. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`guild`** (`Guild`, optional): Guild identifier. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.

## How it works

See the function list below for exact signatures.

`$leaderBoard` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$leaderBoard[value;value;name]
```

**Full form (all arguments)**

```fs
$leaderBoard[value;value;name;value;123456789012345678]
```

## Reference implementation (source)

Taken from `src/functions/board/leaderBoard.js` in the `QuorielDB` repository — this is exactly what runs:

```ts
execute(...) {
        ctx.setEnvironmentKey(variable, leaderBoard(type, name, sorting, guild?.id || ctx.guild.id));
        return this.success();
}
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`sorting`, `guild`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$nearbyBoard`]($nearbyBoard.md)
- [`$pageBoard`]($pageBoard.md)
- [`$positionBoard`]($positionBoard.md)

**Source:** [`src/functions/board/leaderBoard.js`](https://github.com/quoriel/db/blob/main/src/functions/board/leaderBoard.js)
