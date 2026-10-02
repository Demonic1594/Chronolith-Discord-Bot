# $channelKiCopyBanao

> Clones the given channel

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `channel` | v1.4.0 | required | yes | `Channel` |

## Signature

```fs
$channelKiCopyBanao[channel ID;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The channel to clone |
| 2 | `name` | `String` | no | no | The name for the cloned channel |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The channel to clone. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.
- **`name`** (`String`, optional): The name for the cloned channel. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelKiCopyBanao` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelKiCopyBanao[123456789012345678]
```

**Full form (all arguments)**

```fs
$channelKiCopyBanao[123456789012345678;name]
```

## Quirks & gotchas

1. Brackets are REQUIRED — omitting `[...]` is a compile error ("Function X requires brackets").
2. Optional arguments (`name`) resolve to `null` when left empty — the implementation decides what that means (usually a sensible default).
3. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCategoryKaID`]($channelCategoryKaID.md)
- [`$channelKeBacchonKiGinti`]($channelKeBacchonKiGinti.md)
- [`$channelKeBacchonKiIDs`]($channelKeBacchonKiIDs.md)
- [`$channelsKiGinti`]($channelsKiGinti.md)
- [`$channelKabBana`]($channelKabBana.md)
- [`$channelHaiKya`]($channelHaiKya.md)
- [`$channelKaServerID`]($channelKaServerID.md)
- [`$chnlID`]($chnlID.md)
