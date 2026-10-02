# $soundID

> Returns a sound id with given name

| Package | Category | Since | Brackets | Unwrap | Output |
|---|---|---|---|---|---|
| ForgeScript | `soundboard` | v2.4.0 | optional | yes | `SoundboardSound` |

## Signature

```fs
$soundID[guild ID;name]
```

Arguments are separated by `;`. Optional (non-required) trailing arguments may be omitted entirely.

## Parameters

| # | Name | Type | Required | Rest | Description |
|---|---|---|---|---|---|
| 1 | `guild ID` | `Guild` | **yes** | no | The guild to get sound from |
| 2 | `name` | `String` | **yes** | yes | The sound name to return its id |

### Per-parameter notes

- **`guild ID`** (`Guild`, required): The guild to get sound from. Expects a guild ID. Taken from `client.guilds.cache` — the guild must be cached.
- **`name`** (`String` , rest, required): The sound name to return its id. Expects plain text. Passed through as-is after inner `$functions` are resolved and `\` escapes are processed.

## How it works

Soundboard functions manage Discord soundboard sounds.

`$soundID` has `unwrap: true` — every argument is compiled and executed **before** the function body runs: nested `$functions` inside its brackets resolve first, then the resolved values are type-checked (see the parameter notes above) and handed to the implementation. If any argument fails to resolve or type-check, execution of this function stops with a ForgeError and the command aborts (unless the call was silenced with `$#function[...]` or wrapped in `$try[code;catchCode]`).

The `name` argument is a **rest** argument: every remaining `;`-separated value is collected into a list (possibly empty if not required).

## Examples

**Basic usage**

```fs
$soundID[123456789012345678;name]
```

## Reference implementation (source)

Taken from `src/native/soundboard/soundID.ts` in the `ForgeScript` repository — this is exactly what runs:

```ts
execute(...) {
        if (this.hasFields) {
            const name = args.join(";")
            const sounds = await guild.soundboardSounds.fetch().catch(ctx.noop)
            return this.success(sounds?.find((x) => x.name === name)?.soundId)
        }
        return this.success(ctx.sound?.soundId)
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

**Source:** [`src/native/soundboard/soundID.ts`](https://github.com/TryForge/ForgeScript/blob/main/src/native/soundboard/soundID.ts)
