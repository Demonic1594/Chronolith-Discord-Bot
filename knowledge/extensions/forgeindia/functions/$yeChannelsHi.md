# $yeChannelsHi

> Only executes code if given ids match the current channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `limiter` | v1.5.0 | required | no | — |

> aliases: $khaaliInChannelsKeLiye

## Signature

```fs
$yeChannelsHi[code;channels]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `code` | `String` | **yes** | no | The code to execute if channel is not whitelisted |
| 2 | `channels` | `Channel` | **yes** | yes | The channels to check for |

### Per-parameter notes

- **`code`** (`String`, required): The code to execute if channel is not whitelisted. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.
- **`channels`** (`Channel` , rest, required): The channels to check for. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
  - Raw-code argument (this function is `unwrap: false`): inner `$functions` are NOT resolved before execution — the function compiles and runs them itself, lazily.

## How it works

Limiter functions restrict execution (`$onlyIf`, `$onlyForUsers`, `$onlyForRoles`, ...) and early-exit a command via `$stop`.

`$yeChannelsHi` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

The `channels` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$yeChannelsHi[code;123456789012345678]
```

## Quirks & gotchas

1. Callable by its aliases too: `$khaaliInChannelsKeLiye` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
4. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$yeUsersHi`]($yeUsersHi.md)
- [`$sirfAgar`]($sirfAgar.md)
- [`$rukJao`]($rukJao.md)
