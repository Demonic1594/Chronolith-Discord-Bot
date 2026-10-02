# $koiBhiID

> Returns a random user ID

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeIndia | `user` | v1.0.3 | none | no | `User` |

> aliases: $kisiKaID, $userRandomID

## Signature

```fs
$koiBhiID
```

## How it works

User functions read user properties (username, tag, avatar, banners, badges, flags).

`$koiBhiID` has `unwrap: false` — its arguments are passed as **raw code text** and are only compiled/executed when the implementation chooses to (this is what allows multi-statement bodies with `;` inside control-flow functions).

This function takes no arguments (none).

## Examples

```fs
$koiBhiID
```

## Quirks & gotchas

1. Callable by its aliases too: `$kisiKaID`, `$userRandomID` — function names are case-insensitive.
2. Arguments are raw code — nested `$functions` inside them are NOT resolved before this function runs.
3. This function has no brackets — it is used bare.
4. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
5. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$kyaBotHai`]($kyaBotHai.md)
- [`$dmBhej`]($dmBhej.md)
- [`$userKiPhoto`]($userKiPhoto.md)
- [`$userKaBanner`]($userKaBanner.md)
- [`$userKitneHain`]($userKitneHain.md)
- [`$userKabBana`]($userKabBana.md)
- [`$userHaiKya`]($userHaiKya.md)
- [`$sabkeSamneNaam`]($sabkeSamneNaam.md)
