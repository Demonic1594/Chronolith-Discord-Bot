# $membersKhojo

> Finds member of a guild using a query

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `lookup` | v1.4.0 | required | yes | `Unknown[]` |

> aliases: $membersDhoondo

## Signature

```fs
$membersKhojo[guild ID;query;limit;enum value;separator]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to use |
| 2 | `query` | `String` | **yes** | no | The query to use |
| 3 | `limit` | `Number` | no | no | The limit of results |
| 4 | `enum value` | `Enum` | no | no | The enum value to use |
| 5 | `separator` | `String` | no | no | The separator to use for every result |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to use. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`query`** (`String`, required): The query to use. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`limit`** (`Number`, optional): The limit of results. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`enum value`** (`Enum`, optional): The enum value to use. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for every result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$membersKhojo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$membersKhojo[123456789012345678;query]
```

**Full form (all arguments)**

```fs
$membersKhojo[123456789012345678;query;5;value;,]
```

## Quirks & gotchas

1. Callable by its aliases too: `$membersDhoondo` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`limit`, `enum value`, `separator`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelDhoondo`]($channelDhoondo.md)
- [`$channelsDhoondo`]($channelsDhoondo.md)
- [`$emojiKhojo`]($emojiKhojo.md)
- [`$memberKhojo`]($memberKhojo.md)
- [`$userKhojo`]($userKhojo.md)
