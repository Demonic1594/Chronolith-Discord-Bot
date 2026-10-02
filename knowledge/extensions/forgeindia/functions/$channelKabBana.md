# $channelKabBana

> Returns the channel timestamp

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `channel` | v1.0.0 | optional | yes | `Number` |

## Signature

```fs
$channelKabBana[channel ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `channel ID` | `Channel` | **yes** | no | The id of the channel |

### Per-parameter notes

- **`channel ID`** (`Channel`, required): The id of the channel. Expects a channel ID. Must be a 16-23 digit snowflake; fetched from the client's channel cache/API.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$channelKabBana` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$channelKabBana[123456789012345678]
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCategoryKaID`]($channelCategoryKaID.md)
- [`$channelKeBacchonKiGinti`]($channelKeBacchonKiGinti.md)
- [`$channelKeBacchonKiIDs`]($channelKeBacchonKiIDs.md)
- [`$channelsKiGinti`]($channelsKiGinti.md)
- [`$channelHaiKya`]($channelHaiKya.md)
- [`$channelKaServerID`]($channelKaServerID.md)
- [`$chnlID`]($chnlID.md)
- [`$channelKaNaam`]($channelKaNaam.md)
