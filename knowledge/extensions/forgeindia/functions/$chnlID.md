# $chnlID

> Gets the channel id of a channel name

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `channel` | v1.0.0 | optional | yes | `Channel` |

> aliases: $channelKaID, $chnID

## Signature

```fs
$chnlID[name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `name` | `String` | **yes** | yes | The channel name to get its id |

### Per-parameter notes

- **`name`** (`String` , rest, required): The channel name to get its id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Channel functions read and mutate Discord channels — creation, edits, overwrites, topics, NSFW state, slowmode, and per-channel property lookups.

`$chnlID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `name` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$chnlID[name]
```

## Quirks & gotchas

1. Callable by its aliases too: `$channelKaID`, `$chnID` — function names are case-insensitive.
2. Brackets are OPTIONAL — the function works with or without `[...]`.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$channelCategoryKaID`]($channelCategoryKaID.md)
- [`$channelKeBacchonKiGinti`]($channelKeBacchonKiGinti.md)
- [`$channelKeBacchonKiIDs`]($channelKeBacchonKiIDs.md)
- [`$channelsKiGinti`]($channelsKiGinti.md)
- [`$channelKabBana`]($channelKabBana.md)
- [`$channelHaiKya`]($channelHaiKya.md)
- [`$channelKaServerID`]($channelKaServerID.md)
- [`$channelKaNaam`]($channelKaNaam.md)
