# $channelDhoondo

> Finds a channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `lookup` | v1.0.0 | required | yes | `Channel` |

> aliases: $chnlKhojo

## Signature

```fs
$channelDhoondo[query;return channel]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `query` | `String` | **yes** | no | The id, mention or channel name to find |
| 2 | `return channel` | `Boolean` | no | no | Returns the current channel id if none found |

### Per-parameter notes

- **`query`** (`String`, required): The id, mention or channel name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.
- **`return channel`** (`Boolean`, optional): Returns the current channel id if none found. Expects `true` / `false`. Only the literal strings `true` and `false` are accepted (case-sensitive). `yes`, `1`, `on` are REJECTED with InvalidArgType.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$channelDhoondo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelDhoondo[query]
```

**Full form (all arguments)**

```fs
$channelDhoondo[query;true]
```

## Quirks & gotchas

1. Callable by its aliases too: `$chnlKhojo` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Optional arguments (`return channel`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
4. Boolean arguments accept ONLY the literal `true`/`false` strings — `yes`/`no`/`1`/`0` are rejected.
5. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
6. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelsDhoondo`]($channelsDhoondo.md)
- [`$emojiKhojo`]($emojiKhojo.md)
- [`$memberKhojo`]($memberKhojo.md)
- [`$membersKhojo`]($membersKhojo.md)
- [`$userKhojo`]($userKhojo.md)
