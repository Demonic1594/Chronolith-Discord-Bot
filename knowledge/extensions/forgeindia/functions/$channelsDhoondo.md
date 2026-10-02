# $channelsDhoondo

> Finds channels of a guild using a query

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `lookup` | v1.5.0 | required | yes | `Unknown[]` |

> aliases: $chnlsKhojo

## Signature

```fs
$channelsDhoondo[guild ID;query;limit;property;separator;method]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to find the channels on |
| 2 | `query` | `String` | **yes** | no | The id, mention or channel name to find |
| 3 | `limit` | `Number` | no | no | The limit of results |
| 4 | `property` | `Enum` | no | no | The property to return |
| 5 | `separator` | `String` | no | no | The separator to use for every result |
| 6 | `method` | `Enum` | no | no | The method to use for searching |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to find the channels on. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`query`** (`String`, required): The id, mention or channel name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`limit`** (`Number`, optional): The limit of results. Expects a numeric value. Coerced with JS `Number()` — anything that is `NaN` (e.g. `abc`) is rejected with an InvalidArgType error. `5`, `5.5`, `-3`, `1e3` all pass.
- **`property`** (`Enum`, optional): The property to return. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.
- **`separator`** (`String`, optional): The separator to use for every result. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`method`** (`Enum`, optional): The method to use for searching. Expects one of the allowed enum values. Must be an exact key of the function's enum — see the enum's page under `enums/`.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$channelsDhoondo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelsDhoondo[123456789012345678;query]
```

**Full form (all arguments)**

```fs
$channelsDhoondo[123456789012345678;query;5;value;,;value]
```

## Quirks & gotchas

1. Callable by its aliases too: `$chnlsKhojo` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`limit`, `property`, `separator`, `method`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelDhoondo`]($channelDhoondo.md)
- [`$emojiKhojo`]($emojiKhojo.md)
- [`$memberKhojo`]($memberKhojo.md)
- [`$membersKhojo`]($membersKhojo.md)
- [`$userKhojo`]($userKhojo.md)
