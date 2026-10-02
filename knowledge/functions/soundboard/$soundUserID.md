# $soundUserID

> Returns the user who created the sound

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `soundboard` | v2.4.0 | optional | yes | `User` |

## Signature

```fs
$soundUserID[guild ID;sound ID]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get sound from |
| 2 | `sound ID` | `SoundboardSound` | **yes** | no | The sound to return its creator |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get sound from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`sound ID`** (`SoundboardSound`, required): The sound to return its creator. Expects a soundboard sound ID. Fetched from the pointer guild's soundboardSounds manager.
  - This argument is resolved against a previously resolved argument (its "pointer") or the current context — order of arguments matters.

## How it works

Soundboard functions manage Discord soundboard sounds.

`$soundUserID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

## Examples

**Basic usage**

```fs
$soundUserID[123456789012345678;123456789012345678]
```

## Reference implementation (source)

Taken from `src/native/soundboard/soundUserID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        sound ??= ctx.sound!
        return this.success(sound?.user?.id)
}
```

## Quirks & gotchas

1. Brackets are OPTIONAL — the function works with or without `[...]`.
2. Discord entity arguments must be 16-23 digit snowflake IDs — usernames, mentions or full URLs are rejected. Resolve names first with the `lookup`-category functions.
3. Universal prefixes apply: `!` to discard output (`$!fn[...]`), `#` to suppress the error alert (`$#fn[...]` — top-level calls only, and the run still aborts), `@[sep]` to return the count of separated output pieces (`$@[;;]fn[...]`).
4. Errors abort the whole command — `$#fn[...]` only hides the alert (on nested calls `#` is ignored entirely); `$try[code;catchCode;errorVar]` is the only real recovery.

## Related functions

- [`$createSoundboardSound`]($createSoundboardSound.md)
- [`$deleteSoundboardSounds`]($deleteSoundboardSounds.md)
- [`$editSoundboardSound`]($editSoundboardSound.md)
- [`$getSoundboardSound`]($getSoundboardSound.md)
- [`$soundAvailable`]($soundAvailable.md)
- [`$soundCreatedAt`]($soundCreatedAt.md)
- [`$soundEmoji`]($soundEmoji.md)
- [`$soundGuildID`]($soundGuildID.md)

**Source:** [`src/native/soundboard/soundUserID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/soundboard/soundUserID.ts)
