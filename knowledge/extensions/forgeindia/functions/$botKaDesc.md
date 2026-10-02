# $botKaDesc

> Returns the description of the bot

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `bot` | v1.5.0 | none | no | `String` |

## Signature

```fs
$botKaDesc
```

## How it works

Bot functions expose the client itself — its user, settings, uptime, presence and similar self-inspection utilities.

`$botKaDesc` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$botKaDesc
```

## Quirks & gotchas

1. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
2. This function has no brackets — it is used bare.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$botKitneHain`]($botKitneHain.md)
- [`$botUdaao`]($botUdaao.md)
- [`$botKaID`]($botKaID.md)
- [`$botBulawo`]($botBulawo.md)
- [`$botKeBaapKaID`]($botKeBaapKaID.md)
- [`$latencyCheckKaro`]($latencyCheckKaro.md)
- [`$botKiPhotoLgao`]($botKiPhotoLgao.md)
- [`$botBannerSetKaro`]($botBannerSetKaro.md)
