# $emojiKhojo

> Finds an emoji

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `lookup` | v1.0.0 | required | yes | `Emoji` |

> aliases: $emojiDhoondo

## Signature

```fs
$emojiKhojo[query]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `query` | `String` | **yes** | no | The id, format or emoji name to find |

### Per-parameter notes

- **`query`** (`String`, required): The id, format or emoji name to find. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Lookup functions resolve Discord entities by name or other non-ID identifiers.

`$emojiKhojo` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$emojiKhojo[query]
```

## Quirks & gotchas

1. Callable by its aliases too: `$emojiDhoondo` — function names are case-insensitive.
2. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelDhoondo`]($channelDhoondo.md)
- [`$channelsDhoondo`]($channelsDhoondo.md)
- [`$memberKhojo`]($memberKhojo.md)
- [`$membersKhojo`]($membersKhojo.md)
- [`$userKhojo`]($userKhojo.md)
